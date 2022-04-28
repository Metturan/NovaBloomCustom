// import gql from 'graphql-tag'
import { memo } from 'react';
import {useQuery, gql} from '@apollo/client'
import axios from 'axios'
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from "@shopify/app-bridge-utils";
import {Card, Page,ResourceList, Stack, TextStyle, PageActions, Layout, DisplayText} from '@shopify/polaris'

const GET_COLLECTION_BY_ID = gql`
query getProductsFromCollection($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Collection {
      title
      handle
      id
      products(first:20) {
        edges {
          node {
            id
            title
            handle
            images(first:1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
            variants(first:1) {
              edges {
                node{
                  id
                  price
                }
              }
            }
          }
        }
      }
    }
  }
}
`;


function GiftComponent (props) {
  const app = useAppBridge();
  const instance = axios.create();
  instance.interceptors.request.use(function (config) {
     return getSessionToken(app)
         .then((token) => {
         config.headers["Authorization"] = `Bearer ${token}`;
         return config;
         });
  });
  const { loading, error, data } = useQuery(GET_COLLECTION_BY_ID, { variables: { ids: props.cardCollectionId } })

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>
  console.log('no reaload')
  if (data.nodes[0] === null) {
    // window.location.reload();
    return <div></div>
  }

  var productList = data.nodes[0].products.edges

  deleteApiData()

  var cardListArray = {products: productList, collectionTitle: props.collectionTitle}
  makeApiCall(cardListArray)

  async function makeApiCall(productListArray) {
    const url = '/api/cardProducts'

    instance.post(url, productListArray)
      .then(res => console.log(res))
      .catch(err => console.log(err))
  }

  function deleteApiData() {
    const url = '/api/cardProducts'

    instance.delete(url)
  }


  async function removeCardCollectionApi() {
    const url = '/api/collectionCard'
    const cardProductsUrl = '/api/cardProducts'

    await instance.delete(url)
      .then(res => {
        instance.delete(cardProductsUrl)
          .then(res => {
            window.location.reload();
          })
      })
  }


  return (
    <>
    <Layout>
      <Layout.Section>
        <Card title="Card Collection">
          <ResourceList
              showHeader
              resourceName={{ singular: 'Collection', plural: 'Collections' }}
              items={data.nodes}
              renderItem={item => {
                return (
                  <ResourceList.Item
                    id={item.id}
                    accessibilityLabel={`View details for ${item.title}`}
                  >
                    <Stack>
                      <Stack.Item fill>
                        <h3>
                          <TextStyle variation='strong'>
                            {item.title}
                          </TextStyle>
                        </h3>
                      </Stack.Item>
                    </Stack>
                  </ResourceList.Item>
                )
              }}
            />

        </Card>
      </Layout.Section>
      <Layout.Section>
        <div className='redBtn'>
          <PageActions
              primaryAction={{
                content: 'Remove Collection',
                onAction: () => removeCardCollectionApi()
              }}
              
            />
            </div>
      </Layout.Section>
    </Layout>
    </>
  )
}

export default memo(GiftComponent);
