/**
 * Returns whether a row contains billing toggle labels.
 * @param {Element} row
 * @returns {boolean}
 */
function isToggleRow(row) {
  const cells = [...row.children].filter((cell) => cell.textContent.trim());
  if (cells.length !== 2) return false;
  if (cells.some((cell) => cell.querySelector('h1, h2, h3, h4, h5, h6, a'))) return false;
  return cells.every((cell) => cell.textContent.trim().length <= 40);
}

/**
 * Extracts plain-text label from a toggle cell.
 * @param {Element} cell
 * @returns {string}
 */
function getToggleLabel(cell) {
  return cell.textContent.trim();
}

/**
 * Decorates the plan column and returns whether the tier is featured.
 * @param {Element} cell
 * @returns {boolean}
 */
function decoratePlanCell(cell) {
  cell.classList.add('pricing-grid-plan');
  const badgeParagraph = [...cell.querySelectorAll('p')].find((paragraph) => {
    const strong = paragraph.querySelector(':scope > strong');
    return strong && paragraph.textContent.trim() === strong.textContent.trim();
  });

  if (!badgeParagraph) return false;

  const badge = document.createElement('span');
  badge.className = 'pricing-grid-badge';
  badge.textContent = badgeParagraph.querySelector('strong').textContent.trim();
  badgeParagraph.remove();

  const heading = cell.querySelector('h2, h3, h4');
  if (heading) {
    heading.after(badge);
  } else {
    cell.prepend(badge);
  }

  return true;
}

/**
 * Splits pricing cell content into monthly and annual groups.
 * @param {Element} cell
 */
function decoratePricingCell(cell) {
  cell.classList.add('pricing-grid-pricing');

  const monthly = document.createElement('div');
  monthly.className = 'pricing-grid-price pricing-grid-price-monthly';

  const annual = document.createElement('div');
  annual.className = 'pricing-grid-price pricing-grid-price-annual';

  while (cell.firstChild) {
    if (cell.firstChild.nodeName === 'P') {
      annual.append(cell.firstChild);
    } else {
      monthly.append(cell.firstChild);
    }
  }

  cell.append(monthly, annual);
}

/**
 * Converts feature paragraphs to a list and prepares the CTA for button styling.
 * @param {Element} cell
 * @param {boolean} featured
 */
function decorateDetailsCell(cell, featured) {
  cell.classList.add('pricing-grid-details');

  const paragraphs = [...cell.querySelectorAll(':scope > p')];
  const ctaParagraph = paragraphs.find((paragraph) => paragraph.querySelector('a[href]'));
  const featureParagraphs = paragraphs.filter((paragraph) => paragraph !== ctaParagraph);

  if (featureParagraphs.length) {
    const list = document.createElement('ul');
    list.className = 'pricing-grid-features';

    featureParagraphs.forEach((paragraph) => {
      const item = document.createElement('li');
      item.append(...paragraph.childNodes);
      list.append(item);
      paragraph.remove();
    });

    cell.prepend(list);
  }

  if (!ctaParagraph) return;

  ctaParagraph.classList.add('pricing-grid-cta');
  const link = ctaParagraph.querySelector('a[href]');
  if (!link || link.closest('strong, em')) return;

  const strong = document.createElement('strong');
  strong.append(link);

  if (featured) {
    const em = document.createElement('em');
    em.append(strong);
    ctaParagraph.replaceChildren(em);
    return;
  }

  ctaParagraph.replaceChildren(strong);
}

/**
 * Creates the billing period toggle control.
 * @param {Element} block
 * @param {string} monthlyLabel
 * @param {string} annualLabel
 * @param {boolean} defaultAnnual
 * @returns {Element}
 */
function createBillingToggle(block, monthlyLabel, annualLabel, defaultAnnual) {
  const toggle = document.createElement('div');
  toggle.className = 'pricing-grid-toggle';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Billing period');

  const monthlyButton = document.createElement('button');
  monthlyButton.type = 'button';
  monthlyButton.className = 'pricing-grid-toggle-option';
  monthlyButton.dataset.period = 'monthly';
  monthlyButton.textContent = monthlyLabel;

  const annualButton = document.createElement('button');
  annualButton.type = 'button';
  annualButton.className = 'pricing-grid-toggle-option';
  annualButton.dataset.period = 'annual';
  annualButton.textContent = annualLabel;

  toggle.append(monthlyButton, annualButton);

  const setPeriod = (period) => {
    const isAnnual = period === 'annual';
    block.classList.toggle('annual', isAnnual);
    block.classList.toggle('monthly', !isAnnual);
    monthlyButton.setAttribute('aria-pressed', String(!isAnnual));
    annualButton.setAttribute('aria-pressed', String(isAnnual));
  };

  monthlyButton.addEventListener('click', () => setPeriod('monthly'));
  annualButton.addEventListener('click', () => setPeriod('annual'));

  [monthlyButton, annualButton].forEach((button) => {
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const next = button.dataset.period === 'monthly' ? annualButton : monthlyButton;
      setPeriod(next.dataset.period);
      next.focus();
    });
  });

  setPeriod(defaultAnnual ? 'annual' : 'monthly');
  return toggle;
}

/**
 * Decorates a tier row into a list item.
 * @param {Element} row
 * @returns {Element}
 */
function buildTierItem(row) {
  const cells = [...row.children];
  const item = document.createElement('li');
  item.className = 'pricing-grid-tier';

  let planCell;
  let pricingCell;
  let detailsCell;

  if (cells.length >= 3) {
    [planCell, pricingCell, detailsCell] = cells;
  } else if (cells.length === 2) {
    [planCell, detailsCell] = cells;
    pricingCell = document.createElement('div');
  } else {
    [detailsCell] = cells;
    planCell = document.createElement('div');
    pricingCell = document.createElement('div');
  }

  const featured = decoratePlanCell(planCell);

  if (pricingCell.textContent.trim()) {
    decoratePricingCell(pricingCell);
  } else {
    pricingCell.classList.add('pricing-grid-pricing');
  }

  decorateDetailsCell(detailsCell, featured);

  if (featured) item.classList.add('featured');

  item.append(planCell, pricingCell, detailsCell);
  return item;
}

/**
 * decorate the block
 * @param {Element} block the block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const defaultAnnual = block.classList.contains('annual-default');

  let monthlyLabel = 'Monthly';
  let annualLabel = 'Annual';
  let tierRows = rows;

  if (rows.length && isToggleRow(rows[0])) {
    const [monthlyCell, annualCell] = [...rows[0].children].filter(
      (cell) => cell.textContent.trim(),
    );
    monthlyLabel = getToggleLabel(monthlyCell);
    annualLabel = getToggleLabel(annualCell);
    tierRows = rows.slice(1);
  }

  const toggle = createBillingToggle(block, monthlyLabel, annualLabel, defaultAnnual);
  const list = document.createElement('ul');
  list.className = 'pricing-grid-tiers';

  tierRows.forEach((row) => {
    list.append(buildTierItem(row));
  });

  block.replaceChildren(toggle, list);
}
