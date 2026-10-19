#!/usr/bin/env python3
"""Audubon local sermon processor and optional R2 transfer helper.

Consumes the JSON exported by media-studio.js. Never deletes remote media,
changes the public catalog, or handles access tokens in this source file.
See docs/GITHUB_PAGES_R2_LINUX_QUICKSTART.md before production use.
"""

import argparse
from datetime import date
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys

KEY_PATTERN = re.compile(
    r"^sermons/[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+/(video-720p\.mp4|audio-96k\.mp3)$"
)


def fail(message):
    raise ValueError(message)


def require_program(name):
    if not shutil.which(name):
        fail(f"Required program not found: {name}")


def shlex_quote(value):
    # For human-readable logs; subprocess receives an argument list, not a shell.
    import shlex
    return shlex.quote(str(value))


def run(command, dry_run=False):
    print("+ " + " ".join(shlex_quote(part) for part in command), flush=True)
    if not dry_run:
        subprocess.run(command, check=True)


def parse_time(value, label):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        fail(f"{label} must be a number")
    if not math.isfinite(value) or value < 0:
        fail(f"{label} must be finite and nonnegative")
    return float(value)


def safe_title(value):
    if not isinstance(value, str) or not value.strip() or len(value) > 180:
        fail("A valid sermon title is required")
    return value.strip()


def slugify(title):
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:56].strip("-")
    if not slug:
        fail("Title needs at least one Latin letter or number for its file name")
    return slug


def load_job(job_path, source):
    job = json.loads(job_path.read_text(encoding="utf-8"))
    if job.get("schemaVersion") != 1:
        fail("Unsupported job schemaVersion")
    metadata = job.get("sermon")
    edit = job.get("edit")
    expected_source = job.get("source")
    if not all(isinstance(item, dict) for item in (metadata, edit, expected_source)):
        fail("Job must contain source, edit, and sermon objects")
    title = safe_title(metadata.get("title"))
    if not isinstance(metadata.get("scripture"), str) or not metadata["scripture"].strip():
        fail("A Scripture reference is required")
    if source.name != expected_source.get("fileName"):
        fail("Selected source file name differs from the Studio job")
    if not source.is_file():
        fail("Source recording does not exist")
    if source.stat().st_size != expected_source.get("fileSize"):
        fail("Source file size differs from the Studio job; select the correct master")
    start = parse_time(edit.get("trimStartSeconds"), "trim start")
    end = parse_time(edit.get("trimEndSeconds"), "trim end")
    total = parse_time(expected_source.get("durationSeconds"), "source duration")
    if end <= start + 1 or end > total + 2:
        fail("Trim range must last more than one second and fit the recorded duration")
    gain = edit.get("gainDb", 0)
    if isinstance(gain, bool) or gain not in (-3, 0, 3, 6):
        fail("Audio gain must be one of -3, 0, 3, or 6 dB")
    for key in ("normalizeSpeech", "shortFade", "createAudioOnly"):
        if not isinstance(edit.get(key), bool):
            fail(f"{key} must be true or false")
    return job, title, start, end, gain


def verify_streams(source):
    require_program("ffprobe")
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "stream=codec_type",
        "-of", "json", str(source)
    ], capture_output=True, text=True, check=True)
    streams = {
        stream.get("codec_type") for stream in
        json.loads(result.stdout).get("streams", [])
    }
    if not {"video", "audio"}.issubset(streams):
        fail("The selected recording needs video and audio streams")


def video_filters(duration, faded):
    filters = ["scale=w='min(1280,iw)':h=-2", "setsar=1"]
    if faded and duration > 2:
        filters += [
            "fade=t=in:st=0:d=0.5",
            f"fade=t=out:st={duration - 0.5:.3f}:d=0.5"
        ]
    return ",".join(filters)


def audio_filters(duration, normalize, gain, faded):
    filters = []
    if normalize:
        filters.append("loudnorm=I=-16:TP=-3:LRA=11")
    if gain:
        filters.extend([f"volume={gain}dB", "alimiter=limit=0.98"])
    if faded and duration > 2:
        filters += [
            "afade=t=in:st=0:d=0.5",
            f"afade=t=out:st={duration - 0.5:.3f}:d=0.5"
        ]
    return ",".join(filters) if filters else "anull"


def process(args):
    require_program("ffmpeg")
    source = Path(args.source).expanduser().resolve()
    job_path = Path(args.job).expanduser().resolve()
    job, title, start, end, gain = load_job(job_path, source)
    verify_streams(source)
    if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", args.date):
        fail("--date must be YYYY-MM-DD")
    try:
        recording_date = date.fromisoformat(args.date).isoformat()
    except ValueError:
        fail("--date must be a valid YYYY-MM-DD")
    folder = f"{recording_date}-{slugify(title)}"
    output = Path(args.output).expanduser().resolve() / folder
    if output.exists():
        fail("Output folder already exists; no existing sermon will be overwritten")
    duration = end - start
    edit = job["edit"]
    input_args = [
        "-hide_banner", "-nostdin", "-n", "-ss", f"{start:.3f}",
        "-i", str(source), "-t", f"{duration:.3f}"
    ]
    afilter = audio_filters(
        duration, edit["normalizeSpeech"], gain, edit["shortFade"]
    )
    video_name = "video-720p.mp4"
    audio_name = "audio-96k.mp3"
    video_cmd = [
        "ffmpeg", *input_args, "-map", "0:v:0", "-map", "0:a:0",
        "-vf", video_filters(duration, edit["shortFade"]),
        "-af", afilter, "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "27", "-maxrate", "1700k", "-bufsize", "3400k",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-ac", "2", "-b:a", "96k",
        "-movflags", "+faststart", str(output / video_name)
    ]
    audio_cmd = [
        "ffmpeg", *input_args, "-map", "0:a:0", "-vn", "-af", afilter,
        "-c:a", "libmp3lame", "-ac", "1", "-b:a", "96k",
        str(output / audio_name)
    ]
    prefix = f"sermons/{folder}"
    manifest = {
        "schemaVersion": 1,
        "sermon": {
            k: job["sermon"].get(k, "")
            for k in ("title", "scripture", "speaker", "series", "tags")
        },
        "date": recording_date,
        "objects": [{"file": video_name, "key": f"{prefix}/{video_name}"}]
    }
    if edit["createAudioOnly"]:
        manifest["objects"].append({
            "file": audio_name, "key": f"{prefix}/{audio_name}"
        })
    if args.dry_run:
        print("DRY RUN: no directory created, no media encoded, no upload")
    else:
        output.mkdir(parents=True)
    run(video_cmd, args.dry_run)
    if edit["createAudioOnly"]:
        run(audio_cmd, args.dry_run)
    if not args.dry_run:
        (output / "upload-manifest.json").write_text(
            json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
        )
    print("Upload manifest:", json.dumps(manifest, indent=2))
    print(
        "IMPORTANT: Verify video/audio, upload, test public HTTPS URLs, "
        "then edit sermon-catalog.json manually."
    )


def validate_key(key):
    if not isinstance(key, str) or not KEY_PATTERN.fullmatch(key):
        fail("Refusing unrecognized R2 object path")
    return key


def validate_remote(value):
    if not re.fullmatch(r"[A-Za-z0-9_-]+", value):
        fail("Invalid rclone remote")
    return value


def validate_bucket(value):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,61}[a-z0-9]", value):
        fail("Invalid R2 bucket name")
    return value


def upload(args):
    require_program("rclone")
    folder = Path(args.bundle).expanduser().resolve()
    manifest = json.loads(
        (folder / "upload-manifest.json").read_text(encoding="utf-8")
    )
    if manifest.get("schemaVersion") != 1 or not isinstance(manifest.get("objects"), list):
        fail("Unrecognized upload manifest")
    remote = validate_remote(args.remote)
    bucket = validate_bucket(args.bucket)
    objects = manifest["objects"]
    if not objects or len(objects) > 2:
        fail("Manifest needs one video and optionally one audio file")
    for item in objects:
        name = item.get("file")
        key = validate_key(item.get("key"))
        if name not in ("video-720p.mp4", "audio-96k.mp3") or not key.endswith("/" + name):
            fail("Object name does not match its R2 key")
        local = folder / name
        if not local.is_file():
            fail(f"Missing processed file: {local}")
        dest = f"{remote}:{bucket}/{key}"
        run(
            ["rclone", "copyto", str(local), dest, "--immutable", "--progress"],
            args.dry_run
        )
        print(
            f"VERIFY: remote {dest}, size {local.stat().st_size} bytes; "
            "then check public HTTPS playback"
        )
    print("No catalog changes or remote deletions were made.")


def restore(args):
    require_program("rclone")
    key = validate_key(args.key)
    remote = validate_remote(args.remote)
    bucket = validate_bucket(args.bucket)
    dest = Path(args.dest).expanduser().resolve()
    if dest.exists():
        fail("Destination already exists; will not overwrite it")
    if not dest.parent.is_dir():
        fail("Destination directory does not exist")
    run(
        [
            "rclone", "copyto", f"{remote}:{bucket}/{key}", str(dest),
            "--immutable", "--progress"
        ],
        args.dry_run
    )
    print("Downloaded a delivery copy, not the original master. Verify its content.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)

    p = sub.add_parser("process", help="Trim/encode a saved Media Studio job")
    p.add_argument("--source", required=True, help="Original recording path")
    p.add_argument("--job", required=True, help="Studio-exported JSON job")
    p.add_argument("--date", required=True, help="Sermon date (YYYY-MM-DD)")
    p.add_argument("--output", required=True, help="Parent folder for delivery copies")
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=process)

    p = sub.add_parser("upload", help="Upload processed bundle files to R2 with rclone")
    p.add_argument("--bundle", required=True, help="Processed sermon directory")
    p.add_argument("--remote", default="r2", help="rclone remote name")
    p.add_argument("--bucket", required=True, help="R2 public-media bucket")
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=upload)

    p = sub.add_parser("restore", help="Download a previously published R2 copy")
    p.add_argument("--key", required=True, help="R2 object key from manifest")
    p.add_argument("--dest", required=True, help="Existing folder / new filename")
    p.add_argument("--remote", default="r2", help="rclone remote name")
    p.add_argument("--bucket", required=True, help="R2 public-media bucket")
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=restore)

    args = parser.parse_args()
    try:
        args.func(args)
    except (ValueError, OSError, json.JSONDecodeError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"ERROR: {error}\n")


if __name__ == "__main__":
    main()
