# Pricing Grid — Author Guide

Share this with authors creating content in **Google Docs**, **Google Sheets**, or **DA**.

## Where content goes

- **Section intro** (headline + subcopy): normal text **above** the table
- **Pricing Grid block**: one table below the intro

## Table layout

**Row 1 — Block name** (merge all 3 columns):

| Pricing Grid |
|:---:|

**Row 2 — Billing toggle labels:**

| Monthly | Annual | |
|:---:|:---:|:---:|

**Rows 3–5 — One row per plan:**

| Plan | Pricing | Details |
|:---:|:---:|:---:|
| **Starter** | **$9**/month<br>**$90**/year | 5 projects<br>10 GB storage<br>Email support<br>[Get Started](link) |
| **Pro**<br>**Most Popular** | **$29**/month<br>**$290**/year<br>*Save 17%* | Unlimited projects<br>100 GB storage<br>Priority support<br>[Start Free Trial](link) |
| **Enterprise** | **$99**/month<br>**$990**/year | SSO & SAML<br>Dedicated support<br>Custom SLA<br>[Contact Sales](link) |

## Column rules

| Column | Author enters | Formatting |
|--------|---------------|------------|
| **Plan** | Tier name + optional badge | Heading 3 for name; badge = **bold** on its own line |
| **Pricing** | Monthly + annual prices | Monthly on first line; annual in new paragraph; savings in *italics* |
| **Details** | Features + CTA | One feature per paragraph; last line = link for the button |

## Do / Don't

| Do | Don't |
|----|-------|
| Use **bold** for prices and badge text | Add header rows like `Plan \| Price \| Features` |
| Use *italics* for savings (e.g. *Save 17%*) | Use bulleted lists inside cells |
| Put both monthly **and** annual prices in Pricing | Add config rows (`limit \| 3`) |
| Keep the Monthly \| Annual toggle row | Delete the toggle row |
| Put section headline **above** the table | Put intro text inside the block table |

## What authors control vs. what code handles

| Authors control | Code handles automatically |
|-----------------|----------------------------|
| Plan names, prices, features, links | Toggle UI and monthly/annual switching |
| Badge text (**Most Popular**, etc.) | Featured card highlight |
| Toggle labels (Monthly / Annual) | Responsive 3-column layout |
| Section headline above the table | Feature checkmarks and button styling |

## Optional variant

- **`Pricing Grid (annual-default)`** — page loads with annual billing selected
