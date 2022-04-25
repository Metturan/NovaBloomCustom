import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from "@shopify/app-bridge-utils";
import { EmptyState, Layout, Page, Heading, Card } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';

import TestComponent from '../components/TestComponent'


const Index = () => {
  const app = useAppBridge();
  const instance = axios.create();
  instance.interceptors.request.use(function (config) {
     return getSessionToken(app)
         .then((token) => {
         config.headers["Authorization"] = `Bearer ${token}`;
         return config;
         });
  });

  const [modal, setModal] = useState({ open: false })
  const [modalProd, setModalProd] = useState({ open: false })
  const [collectionId, setCollectionId] = useState('')
  const [collectionTitle, setCollectionTitle] = useState('')

  useEffect(() => {
    getUpsellCollection()
  }, [])

  
  function handleSelection(resources) {
    const collectionIdFromResources = resources.selection[0].id;
    const title = resources.selection[0].title
    console.log(resources)
    setModal({open:false})
    
    // change this to removing the products
    setUpsellCollection(collectionIdFromResources, title)
  }

  function setUpsellCollection(collectionIdFromResources, title) {
    const url = '/api/collectionUpsell'
    console.log(collectionIdFromResources)

    instance.post(url, {"collection": collectionIdFromResources, "title": title})
      .then(res => {
        setCollectionId(collectionIdFromResources)
        setCollectionTitle(title)
      })
  }

  function getUpsellCollection() {
    const url = '/api/collectionUpsell'

    instance.get(url)
      .then(res => {
        if (res.data.data.length) {
          setCollectionId(res.data.data[0].upsellCollectionId)
        } else {
          setCollectionId('')
        }
    })
  }

  function removeUpsellCollectionApi() {
    const url = '/api/collectionUpsell'
    instance.delete(url)
      .then(res => {
        instance.delete('/api/products')
          .then(() => window.location.reload())
        // window.location.reload();
      })
  }

  return (
      <Page>
          <ResourcePicker
            resourceType="Collection"
            selectMultiple={false}
            open={modal.open}
            onCancel={() =>  setModal({open: false}) }
            onSelection={(resources) => handleSelection(resources)}
          />
        
       {collectionId ? 
       <TestComponent collectionTitle={collectionTitle} collectionId={collectionId} removeCollection={() => removeUpsellCollectionApi()}/>
        :
        <Card sectioned>
          <EmptyState
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          heading="Manage your Upsells"
          action={{
            content: 'Select Collection',
            onAction: () => setModal({open:true})
          }}
          >
          </EmptyState>
        </Card>
        }
        
        
      </Page>
  )
};

export default Index;
