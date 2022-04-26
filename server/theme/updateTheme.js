const axios = require('axios');
const fs = require('fs')
const path = require("path");

const shopifyHeader = (token) => ({
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': token,
});

console.log('running')

// import asdf from '../snippets/storetasker-mett.liquid'
const THEME_SNIPPET = '{% include \'storetasker-theme\' %}';
const CART_SNIPPET = '{% include \'storetasker-mett-cart\' %}';
const THEME_SNIPPET_VALUE = fs.readFileSync(path.resolve(__dirname, '../snippets/storetasker-theme.liquid'), 'utf-8');
const THEME_CART_SNIPPET_VALUE = fs.readFileSync(path.resolve(__dirname, '../snippets/storetasker-mett-cart.liquid'), 'utf-8');

const updateThemeLiquid = async (accessToken, shop) => {
  const theme_url = `https://${shop}/admin/api/2021-10/themes.json`;
  const getTheme = await axios.get(theme_url, { headers: shopifyHeader(accessToken) });
  const theme = getTheme.data.themes.filter(
      (theme) => theme.role == 'main'
  )[0];

  // console.log(theme.id)
  const asset_url = `https://${shop}/admin/api/2021-10/themes/${theme.id}/assets.json?asset[key]=layout/theme.liquid`;
  const cart_url = `https://${shop}/admin/api/2021-10/themes/${theme.id}/assets.json?asset[key]=sections/static-cart.liquid`;
  const getThemeLiquid = await axios.get(asset_url, { headers: shopifyHeader(accessToken) });
  let { value } = getThemeLiquid.data.asset;
  const asset_put_url = `https://${shop}/admin/api/2021-10/themes/${theme.id}/assets.json`;


  // console.log(value)
  if (!value.includes(THEME_SNIPPET)) {
    value = value.replace('</body>', `${THEME_SNIPPET}\n</body>`);

    const themeBody = JSON.stringify({
      asset: {
          key: 'layout/theme.liquid',
          value
      }
    });

    await axios.put(asset_put_url, themeBody, { headers: shopifyHeader(accessToken) });
  }

  const snippetBody = JSON.stringify({
    asset: {
        key: 'snippets/storetasker-theme.liquid',
        value: THEME_SNIPPET_VALUE
    }
  });

  await axios.put(asset_put_url, snippetBody, { headers: shopifyHeader(accessToken) });

  // Add include snippet in cart section
  const getCartLiquid = await axios.get(cart_url, { headers: shopifyHeader(accessToken) });
  let cartValue = getCartLiquid.data.asset.value;
  // console.log(cartValue)

  if (!cartValue.includes(CART_SNIPPET)) {
    cartValue = cartValue.replace('</form>', `</form>\n${CART_SNIPPET}`);

    const cartBody = JSON.stringify({
      asset: {
          key: 'sections/static-cart.liquid',
          value: cartValue
      }
    });

    await axios.put(asset_put_url, cartBody, { headers: shopifyHeader(accessToken) });
  }

// Add cart snippet code file named storetasker-mett-cart.liquid to editor
  const snippetCartBody = JSON.stringify({
    asset: {
        key: 'snippets/storetasker-mett-cart.liquid',
        value: THEME_CART_SNIPPET_VALUE
    }
  });

  await axios.put(asset_put_url, snippetCartBody, { headers: shopifyHeader(accessToken) });
}

module.exports = {
  updateThemeLiquid
}