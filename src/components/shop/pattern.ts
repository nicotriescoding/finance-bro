/**
 * The Bro Shop's money pattern behind every product tile (see the comment
 * above ProductCard in src/app/products/page.tsx for why the photo sits on a
 * white tile on top of it). Shared with MysteryCard, so the "?" tile matches
 * its neighbours.
 */
export const MONEY_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>" +
        "<g font-family='ui-sans-serif,system-ui' font-weight='800' fill='#1c6b45' fill-opacity='.13'>" +
        "<text x='8' y='30' font-size='22' transform='rotate(-18 8 30)'>$</text>" +
        "<text x='70' y='40' font-size='16' transform='rotate(12 70 40)'>%</text>" +
        "<text x='30' y='90' font-size='18' transform='rotate(8 30 90)'>€</text>" +
        "<text x='84' y='100' font-size='24' transform='rotate(-10 84 100)'>$</text></g>" +
        "<g font-size='14' fill-opacity='.4'><text x='50' y='70'>💸</text><text x='100' y='20'>📈</text></g></svg>"
)}")`;
