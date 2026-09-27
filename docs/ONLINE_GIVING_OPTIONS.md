# Online Giving Provider Options

Last reviewed: 2026-09-27

## Design rule

Audubon's website/app should **never store raw card or bank credentials**.

The church site should present the giving experience, funds, and explanatory content, while an established PCI-compliant payment provider performs the financial transaction.

## Recommended first evaluation: Zeffy

### Cost

For eligible nonprofit organizations:

- $0 monthly platform fee;
- $0 transaction fee to the nonprofit;
- Zeffy covers card-processing fees;
- funding model is optional donor contributions/tips to Zeffy.

For US organizations, Zeffy requires an EIN and a bank account in the organization's legal name; a formal 501(c)(3) determination is not required to begin if the nonprofit otherwise qualifies.

### Features

- embeddable donation form;
- hosted giving page;
- cards;
- Apple Pay;
- Google Pay;
- bank-transfer support on eligible forms;
- recurring giving;
- automatic tax receipts;
- donor records.

Recurring options published by Zeffy are monthly, quarterly, and yearly rather than weekly.

### Integration

Website: easy. Embed the Zeffy form or use a Giving button that opens the hosted form.

Future PWA/app: easy to launch the hosted mobile-optimized form; less flexible than a native API-driven Stripe checkout.

Important tradeoff: Zeffy is the form **and** processor. It is not an API-first payment gateway that we can completely redesign inside our own checkout.

## Church-specific alternative: Tithely Giving

### Cost

No setup fee and no monthly fee for basic Tithely Giving.

US transaction rates:

- most cards: 2.9% + $0.30;
- American Express: 3.5% + $0.30;
- ACH/bank: 1% + $0.30.

### Features

- church-specific funds;
- recurring giving;
- weekly / biweekly / monthly recurring schedules in the donor app;
- Apple Pay / Google Pay;
- tax statements;
- donor reporting;
- direct link;
- website embed;
- QR codes;
- optional donor fee coverage.

### Integration

Website: very easy through direct URL or embed code.

Future app: easy through its giving form / donor app ecosystem, though less custom than an API-first Stripe integration.

This is a strong choice if church-specific workflows and weekly recurring giving matter more than minimizing processing cost.

## Developer-control alternative: Stripe

### Standard US pricing

- cards: 2.9% + $0.30;
- ACH Direct Debit: 0.8%, capped at $5 per transaction.

### Advantages

- best custom web/mobile developer tooling among these options;
- excellent APIs and native mobile SDKs;
- complete control over the giving interface;
- ACH can be inexpensive for larger recurring gifts.

### Tradeoffs

Audubon would need to build or integrate:

- donor management;
- contribution statements / tax receipt workflows;
- recurring-gift management UX;
- fund designation/reporting;
- administrative reconciliation features.

Stripe is attractive if we want the giving experience to feel completely native to the future Audubon app.

## PayPal charity rate

Eligible charities that apply and are approved can receive PayPal's charity transaction rate.

Current domestic US charity rate:

- 1.99% + $0.49.

This is less expensive than a standard 2.9% + $0.30 card rate for many typical gifts, but the fixed $0.49 portion makes the advantage smaller for small donations.

## Example monthly processing cost

Assume **80 online gifts per month** (roughly 20 each Sunday).

### If the average gift is $50

Monthly online giving = $4,000.

Approximate provider cost:

- Zeffy: **$0**
- Stripe cards: **$140**
- Stripe ACH: **$32**
- Tithely cards: **$140**
- Tithely ACH: **$64**
- PayPal approved charity rate: **$118.80**

These examples assume every transaction uses the named method and do not include unusual disputes, international cards, optional donor fee coverage, or other add-ons.

## Proposed decision

### First choice for cost

**Pilot Zeffy first**, provided church leadership is comfortable with Zeffy's optional donor-tip model and monthly/quarterly/yearly recurring schedule.

Why:

- no processing cost to Audubon;
- no monthly fee;
- simple embed;
- strong mobile checkout;
- digital wallets;
- recurring giving;
- receipts and donor records already included.

### If weekly recurring giving or a church-specific giving workflow is important

Use **Tithely Giving**.

### If a future fully native app checkout is more important than built-in church accounting workflows

Use **Stripe**, strongly encouraging ACH for recurring contributions when appropriate.

## Questions for leadership / treasurer

Before selecting a provider:

1. Is Audubon comfortable with donors being asked for an optional provider tip?
2. Is weekly recurring giving important, or are monthly recurring gifts sufficient?
3. Must the church generate year-end statements directly from the provider?
4. Does the treasurer need QuickBooks/accounting integrations?
5. Does the church want a completely native giving screen in the future app?
6. Should donors be encouraged to use ACH because of lower processing costs?
7. Which designated funds need to appear at launch?
