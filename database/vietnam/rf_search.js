(() => {
  // The payload's searchResults are a different set of listings (recommendations), so every
  // card field here comes from the card the browser rendered, keyed by its own link.
  const nodes = [...document.querySelectorAll('[itemprop="itemListElement"]')];
  const cards = [];
  for (const node of nodes) {
    const link = node.querySelector('a[href*="/rooms/"]');
    const id = (link?.getAttribute('href')?.match(/\/rooms\/(\d+)/) || [])[1] || '';
    if (!id) continue;
    const text = node.innerText.replace(/\s+/g, ' ').trim();
    cards.push({
      id,
      cardText: text.slice(0, 600),
      photoCount: Number((text.match(/\/\s*(\d+)\s*ảnh/) || [])[1] || 0) || null,
      guestFavorite: /Được khách yêu thích/.test(text),
    });
  }
  const next = document.querySelector('a[aria-label*="tiếp"],a[aria-label*="Next"],nav a[href*="cursor="]');
  return JSON.stringify({
    title: document.title,
    cards,
    next: next ? next.getAttribute('href') : null,
    seen: cards.length,
  });
})()
