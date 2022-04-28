import {useState, useEffect} from 'react'
import { ResourcePicker, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import axios from 'axios'
import { getSessionToken } from "@shopify/app-bridge-utils";
import {Card, Stack, Page, EmptyState, TextField, ResourceList, TextStyle, PageActions, Layout, DisplayText} from '@shopify/polaris'
import GiftComponent from '../components/GiftComponent';


const giftCard = (props) => {

 const app = useAppBridge();
 const instance = axios.create();
    instance.interceptors.request.use(function (config) {
    return getSessionToken(app)
        .then((token) => {
        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
        });
 });

  useEffect(() => {
    initFunction();
  }, [])

  const [modal, setModal] = useState({ open: false })
  const [textFieldOne, setTextFieldOne] = useState('')
  const [textFieldTwo, setTextFieldTwo] = useState('')
  const [textFieldThree, setTextFieldThree] = useState('')
  const [textFieldFour, setTextFieldFour] = useState('')
  const [textFieldFive, setTextFieldFive] = useState('')
  const [textFieldSix, setTextFieldSix] = useState('')
  const [textFieldSeven, setTextFieldSeven] = useState('')
  const [textFieldEight, setTextFieldEight] = useState('')
  const [textFieldNine, setTextFieldNine] = useState('')

  const [cardCollectionId, setCardCollectionId] = useState('')
  const [collectionTitle, setCollectionTitle] = useState('')

  async function initFunction() {
    await instance.get('/api/deliveryInstructions')
    .then(res => {
      res.data.data.forEach(option => {
        if (option.deliveryOptionsId.index === 0) {
          setTextFieldOne(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 1) {
          setTextFieldTwo(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 2) {
          setTextFieldThree(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 3) {
          setTextFieldFour(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 4) {
          setTextFieldFive(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 5) {
          setTextFieldSix(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 6) {
          setTextFieldSeven(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 7) {
          setTextFieldEight(option.deliveryOptionsId.field)
        }
        if (option.deliveryOptionsId.index === 8) {
          setTextFieldNine(option.deliveryOptionsId.field)
        }
      })

       instance.get('/api/collectionCard')
        .then(res => {
       
          if (res.data.data.length) {
            var collectionId = res.data.data[0].cardCollectionId

            if (collectionId) {
              setCardCollectionId(collectionId)
            } else {
              setCardCollectionId('')
            }
          }
        })
    })
    .catch(err => console.log(err))
  }

  function handleSelection(resources) {
    const collectionIdFromResources = resources.selection[0].id;
    const title = resources.selection[0].title
    setModal({open:false})

    setCardCollectionFn(collectionIdFromResources, title)
  }

  function setCardCollectionFn(collectionIdFromResources, title) {
    const url = '/api/collectionCard'

    instance.post(url, {"collection": collectionIdFromResources, "title": title})
    .then(res => {
      console.log("collectionIdFromResources:",collectionIdFromResources)
      setCardCollectionId(collectionIdFromResources)
      setCollectionTitle(title)
    })
  }

  function handleChangeTextFieldOne (textFieldOne) { setTextFieldOne(textFieldOne)};
  function handleChangeTextFieldTwo (textFieldTwo) { setTextFieldTwo(textFieldTwo)};
  function handleChangeTextFieldThree (textFieldThree) { setTextFieldThree(textFieldThree)};
  function handleChangeTextFieldFour (textFieldFour) { setTextFieldFour(textFieldFour)};
  function handleChangeTextFieldFive (textFieldFive) { setTextFieldFive(textFieldFive)};
  function handleChangeTextFieldSix (textFieldSix) { setTextFieldSix(textFieldSix)};
  function handleChangeTextFieldSeven (textFieldSeven) { setTextFieldSeven(textFieldSeven)};
  function handleChangeTextFieldEight (textFieldEight) { setTextFieldEight(textFieldEight)};
  function handleChangeTextFieldNine (textFieldNine) { setTextFieldNine(textFieldNine)};


  async function saveTextFields() {
    const obj = [textFieldOne, textFieldTwo, textFieldThree, textFieldFour, textFieldFive, textFieldSix, textFieldSeven, textFieldEight, textFieldNine]
    deliveryInstructionsDeleteApi(obj)
  }

  function deliveryInstructionsDeleteApi(obj) {
    const url = '/api/deliveryInstructions'

    instance.delete(url)
        .then(() => {
            obj.map((textField, i) => {deliveryInstructionsApi({index: i, field: textField})})
        })
  }

  async function deliveryInstructionsApi(fieldInput) {
    const url = '/api/deliveryInstructions'

    await instance.post(url, fieldInput)
      .then(res => window.location.reload())
      .catch(err => console.log(err))
  }

  return (
    <>
    <Page>
      <Layout>
        <Layout.Section>
          <ResourcePicker
            resourceType="Collection"
            selectMultiple={false}
            open={modal.open}
            onCancel={() =>  setModal({open: false}) }
            onSelection={(resources) => handleSelection(resources)}
          />
        </Layout.Section>
      <Layout.Section>
        {cardCollectionId ? 
          <GiftComponent cardCollectionId={cardCollectionId} collectionTitle={collectionTitle}/>
          :
          <Card sectioned>
            <EmptyState
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              action={{
                content: 'Select Card Collection',
                onAction: () => setModal({open:true})
              }}
            >
            </EmptyState>
          </Card>
          }

            <Card sectioned title="Delivery Instructions">
              <p style={{"marginBottom":"14px"}}>Fill in your specific delivery instructions options to show in the delivery instructions dropdown on the cart page.</p>
              <TextField
                label="Delivery Instructions 1"
                value={textFieldOne}
                multiline={1}
                onChange={handleChangeTextFieldOne}
                autoComplete="off"
              />
              <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 2"
                value={textFieldTwo}
                multiline={1}
                onChange={handleChangeTextFieldTwo}
                autoComplete="off"
              />
               <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 3"
                value={textFieldThree}
                multiline={1}
                onChange={handleChangeTextFieldThree}
                autoComplete="off"
              />
               <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 4"
                value={textFieldFour}
                multiline={1}
                onChange={handleChangeTextFieldFour}
                autoComplete="off"
              />
               <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 5"
                value={textFieldFive}
                multiline={1}
                onChange={handleChangeTextFieldFive}
                autoComplete="off"
              />
               <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 6"
                value={textFieldSix}
                multiline={1}
                onChange={handleChangeTextFieldSix}
                autoComplete="off"
              />
               <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 7"
                value={textFieldSeven}
                multiline={1}
                onChange={handleChangeTextFieldSeven}
                autoComplete="off"
              />
               <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 8"
                value={textFieldEight}
                multiline={1}
                onChange={handleChangeTextFieldEight}
                autoComplete="off"
              />
               <div style={{"margin":"10px"}}></div>
              <TextField
                label="Delivery Instructions 9"
                value={textFieldNine}
                multiline={1}
                onChange={handleChangeTextFieldNine}
                autoComplete="off"
              />
              <PageActions
                primaryAction={{
                  content: 'Save',
                  onAction: () => saveTextFields()
                }}
              />

            </Card>

</Layout.Section>

            </Layout>
          
        

    </Page>
    </>
  )
}

export default giftCard;