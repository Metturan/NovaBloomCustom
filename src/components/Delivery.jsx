import {useState, useEffect} from 'react'
import axios from 'axios'
import { EmptyState, Layout, Page, Heading, TextField, Card, Button } from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from "@shopify/app-bridge-utils";

const Delivery = () => {
  const app = useAppBridge();
  const instance = axios.create();
  instance.interceptors.request.use(function (config) {
     return getSessionToken(app)
         .then((token) => {
         config.headers["Authorization"] = `Bearer ${token}`;
         return config;
         });
  });
  const [initialValue, setInitialValueBlack] = useState([]);
  const [initialValueWhite, setInitialValueWhite] = useState([]);

  const [value, setValue] = useState('');
  const [valueWhite, setValueWhite] = useState('');
  const [whitelistedPostcodes, setWhitelistedPostcodes] = useState([])
  const [blacklistedPostcodes, setBlacklistedPostcodes] = useState([])
  const [removeValueBlack, setRemoveValueBlack] = useState('')
  const [removeValueWhite, setRemoveValueWhite] = useState('')

  const [modalBlacklist, setModalBlacklist] = useState(false);
  const [modalWhitelist, setModalWhitelist] = useState(false);

  useEffect(() => {
    // setInitial value for postcodes from db
    getAndSetPostcode()
  }, []);

  const handleChange = (newValue) => {
    setValue(newValue)
  };

  const handleChangeWhite = (newValue) => {
    setValueWhite(newValue)
  };

  const handleChangeRemoveBlack = (newValue) => {
    setRemoveValueBlack(newValue)

  }
  const handleChangeRemoveWhite = (newValue) => {
    setRemoveValueWhite(newValue)
  }

  async function getAndSetPostcode() {
    const url = '/api/postcode'
    await instance.get('/api/postcode')
      .then((res) => { 
        let postcode = res.data.data[1].postcode
        let postcodeWhite = res.data.data[0].postcode
        if (postcode.length) {
          console.log(postcode)
          setBlacklistedPostcodes(postcode)
          setInitialValueBlack(postcode)
        } else {
          setInitialValueBlack([])
        }

        if (postcodeWhite) {
          setWhitelistedPostcodes(postcodeWhite)
          setInitialValueWhite(postcodeWhite)
        }

      })
      .catch(err => console.log(err))
  }

  async function submitPostcodeAPI(status) {
    const url = '/api/postcode'
    let sendingValue;
    
    if (status == 'blacklisted') {
      let trimResults = value.split(',').map(element => {
        return element.trim();
      });

      sendingValue = [...initialValue, ...trimResults];
    }

    if (status == 'whitelisted') {
      let trimResults = valueWhite.split(',').map(element => {
        return element.trim();
      });

      sendingValue = [...initialValueWhite, ...trimResults];
    }

    await instance.post(url, {"postcodeRecord": sendingValue, "status": status})
      .then(res => {
        window.location.reload();
      })
      .catch(err => console.log(err))
  }

  async function removePostcodeAPI(status) {
    const url = '/api/postcode'
    let sendingValue;
    
    if (status == 'blacklisted') {
      let trimResults = removeValueBlack.split(',').map(element => {
        return element.trim();
      });

      let copyArr = [...initialValue]
      
      for (var i=0; i<trimResults.length;i++) {
        if (copyArr.indexOf(trimResults[i]) > -1) {
          copyArr.splice(copyArr.indexOf(trimResults[i]), 1);
        }
      }
       
      sendingValue = copyArr;
    }
    
    if (status == 'whitelisted') {
      let trimResults = removeValueWhite.split(',').map(element => {
        return element.trim();
      });

      let copyArr = [...initialValueWhite]
      
      for (var i=0; i<trimResults.length;i++) {
        if (copyArr.indexOf(trimResults[i]) > -1) {
          copyArr.splice(copyArr.indexOf(trimResults[i]), 1);
        }
      }
       
      sendingValue = copyArr;
    }

    await instance.post(url, {"postcodeRecord": sendingValue, "status": status})
      .then(res => {
        window.location.reload();
      })
      .catch(err => console.log(err))
  }

  return (
    <Page>
      <Card sectioned>
        <h2 className="testingfont" style={{fontWeight: 'bold', fontSize: '16px'}}>Blacklisted Postcodes</h2>
      <p style={{marginTop: '4px',marginBottom: '35px'}}><span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => setModalBlacklist(true)}>Click here</span> to see list of post codes currently blacklisted</p>
          <TextField
            label="Add postcodes (separate postcodes by comma)"
            value={value}
            onChange={handleChange}
            autoComplete="off"
          />
          <div style={{paddingTop: '10px'}}></div>
          <Button
            large
            primary
            onClick={() => submitPostcodeAPI('blacklisted')}
          >
            Save
          </Button>

          <br/>
          <br/>
          {/* whitelist */}
          
          <TextField
            label="Remove postcodes (separate postcodes by comma)"
            value={removeValueBlack}
            onChange={handleChangeRemoveBlack}
            autoComplete="off"
          />
          <div style={{paddingTop: '10px'}}></div>
          <div className="redBtn">
            <Button
              large
              primary
              onClick={() => removePostcodeAPI('blacklisted')}
            >
              Remove
            </Button>
            </div>
      </Card>

      {
        blacklistedPostcodes.length ?
        <div id="modal-blacklisted" className={ modalBlacklist ? 'show' : 'hide' }>
          <p className="closeModal" onClick={() => setModalBlacklist(false)}>Close</p>
          <Card sectioned title="Blacklisted postcodes">
          <div className="inner-postcodes">
              {
                blacklistedPostcodes.map((code, i) => {
                  return (
                    <div key={i}>{code}</div>
                  )
                })
              }
          </div>
        </Card>
      </div>
        :
        null
      }
    <br/>
    <br/>
      <Card sectioned>
      <h2 style={{fontWeight: 'bold', fontSize: '16px'}}>Whitelisted Postcodes</h2>
      <p style={{marginTop: '4px',marginBottom: '35px'}}><span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => setModalWhitelist(true)}>Click here</span> to see list of post codes currently whitelisted</p>
          <TextField
            label="Add postcodes (separate postcodes by comma)"
            value={valueWhite}
            onChange={handleChangeWhite}
            autoComplete="off"
          />
          <div style={{paddingTop: '10px'}}></div>
          <Button
            large
            primary
            onClick={() => submitPostcodeAPI('whitelisted')}
          >
            Save
          </Button>
          <br/>
          <br/>
          <TextField
            label="Remove postcodes (separate postcodes by comma)"
            value={removeValueWhite}
            onChange={handleChangeRemoveWhite}
            autoComplete="off"
          />
          <div style={{paddingTop: '10px'}}></div>
          <div className="redBtn">
            <Button
              large
              primary
              onClick={() => removePostcodeAPI('whitelisted')}
            >
              Remove
            </Button>
          </div>
          
      </Card>

      {
        whitelistedPostcodes.length ?
        <div id="modal-whitelisted" className={ modalWhitelist ? 'show' : 'hide' }>
          <p className="closeModal" onClick={() => setModalWhitelist(false)}>Close</p>
          <Card sectioned title="Whitelisted postcodes">
          <div className="inner-postcodes">
              {
                whitelistedPostcodes.map((code, i) => {
                  return (
                    <div key={i}>{code}</div>
                  )
                })
              }
          </div>
        </Card>
      </div>
        :
        null
      }

  </Page>
  )
}

export default Delivery;