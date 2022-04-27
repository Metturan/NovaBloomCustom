import axios from 'axios';
import {URL} from 'url'
import fs from 'fs'
import { getSessionToken } from "@shopify/app-bridge-utils";
import {createApp} from '@shopify/app-bridge';


console.log('running theme file')

const THEME_SNIPPET = '{% include \'storetasker-theme\' %}';
const CART_SNIPPET = '{% include \'storetasker-mett-cart\' %}';
const THEME_SNIPPET_VALUE = fs.readFileSync(new URL('../snippets/storetasker-theme.liquid', import.meta.url).pathname);
const THEME_CART_SNIPPET_VALUE = fs.readFileSync(new URL('../snippets/storetasker-mett-cart.liquid', import.meta.url).pathname);

console.log('theme snippet value', THEME_SNIPPET_VALUE)
export const updateThemeLiquid = async (shop, host, apikey) => {
  const app = createApp({
    apiKey: apikey
  });
  const instance = axios.create();
  instance.interceptors.request.use(function (config) {
    return getSessionToken(app)
      .then((token) => {
        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
      });
  });
  const theme_url = `https://${shop}/admin/api/2021-10/themes.json`;
  const getTheme = await instance.get(theme_url);
  const theme = getTheme.data.themes.filter(
      (theme) => theme.role == 'main'
  )[0];

  // console.log(theme.id)
  const asset_url = `https://${shop}/admin/api/2021-10/themes/${theme.id}/assets.json?asset[key]=layout/theme.liquid`;
  const cart_url = `https://${shop}/admin/api/2021-10/themes/${theme.id}/assets.json?asset[key]=sections/static-cart.liquid`;
  const getThemeLiquid = await instance.get(asset_url);
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

    await instance.put(asset_put_url, themeBody);
  }

  const snippetBody = JSON.stringify({
    asset: {
        key: 'snippets/storetasker-theme.liquid',
        value: THEME_SNIPPET_VALUE
    }
  });

  await instance.put(asset_put_url, snippetBody);

  // Add include snippet in cart section
  const getCartLiquid = await instance.get(cart_url);
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

    await instance.put(asset_put_url, cartBody);
  }

// Add cart snippet code file named storetasker-mett-cart.liquid to editor


  const snippetCartBody = JSON.stringify({
    asset: {
        key: 'snippets/storetasker-mett-cart.liquid',
        value: THEME_CART_SNIPPET_VALUE
    }
  });

  await instance.put(asset_put_url, snippetCartBody);
}
