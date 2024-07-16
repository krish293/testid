const axios = require('axios');

const {
  configGeneratorAppUrl,
} = require('../config/index');

const {requestOptionsWithoutCookie} = require('../utils/request-options');
const endpoint = 'wahoo';
const {ApolloError} = require('apollo-server-express');


const getWahooDataGenericFn = (apiName) => (pID, regionCode) => {
  const url = `${configGeneratorAppUrl}/${endpoint}/${apiName}/${pID}/${regionCode}`;
  return axios(requestOptionsWithoutCookie('get', url))
      .then(function(resp) {
        // console.log(resp.data);
        return resp.data;
      })
      .catch(function(error) {
        console.log(error.response.data);
        throw new ApolloError(JSON.stringify(error.response.data), error.response.status, error.response.data);
      });
};

const updateDataPartitionConfig =async (pID, regionCode, data, context)=>{
  const url = `${configGeneratorAppUrl}/${endpoint}/data-partition-config/${pID}/${regionCode}`;
  const changedBy = context.user.email;
  data.changedBy = changedBy;
  data.partnerId = pID;
  data.regionCode = regionCode;

  const requestOption = requestOptionsWithoutCookie('post', url);
  requestOption.data = data;
  requestOption.pID = pID;
  requestOption.regionCode = regionCode;
  return axios(requestOption)
      .then(function(resp) {
        console.log(resp);
        resp.data = {errorMsg: null, success: true};
        return resp.data;
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};

const updateDataFilenameConfig =async (data, context)=>{
  const url = `${configGeneratorAppUrl}/${endpoint}/output-filename-config/${data.partnerId}/${data.regionCode}`;
  const changedBy = context.user.email;
  data.changedBy = changedBy;

  const requestOption = requestOptionsWithoutCookie('post', url);
  requestOption.data = data;
  return axios(requestOption)
      .then(function(resp) {
        console.log(resp);
        resp.data = {errorMsg: null, success: true};
        return resp.data;
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};

const addUpdateDataFrequency =async (dataFrequency, context)=>{
  const changedBy = context.user.email;
  dataFrequency.changedBy = changedBy;
  const url = `${configGeneratorAppUrl}/${endpoint}/scheduler-config`;
  const requestOption = requestOptionsWithoutCookie('post', url);
  requestOption.data = dataFrequency;
  return axios(requestOption)
      .then(function(resp) {
        console.log(resp);
        resp.data = {errorMsg: null, success: true};
        return resp.data;
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};

const getWahooRegionsDataGenericFn = (apiName) => (pID) => {
  const url = `${configGeneratorAppUrl}/${endpoint}/${apiName}/${pID}`;
  return axios(requestOptionsWithoutCookie('get', url))
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(error) {
        console.log(error.response.data);
        throw new ApolloError(JSON.stringify(error.response.data), error.response.status, error.response.data);
      });
};
const saveIdCodec = (idBasedCodec, context) => {
  const apiName = 'id-based-codec';
  idBasedCodec.changedBy = context.user.email;
  const {partnerId: pID, regionCode, isNew} = idBasedCodec;
  const restMethod = isNew ? 'post' : 'put';
  const url = `${configGeneratorAppUrl}/${endpoint}/${apiName}/${pID}/${regionCode}`;
  const requestOption = requestOptionsWithoutCookie(restMethod, url);
  requestOption.data = idBasedCodec;
  return axios(requestOption)
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(error) {
        console.log(error.response.data);
        throw new ApolloError(JSON.stringify(error.response.data), error.response.status, error.response.data);
      });
};

const deleteDataFrequencyByRegion = async (pID, regionCode)=>{
  const url = `${configGeneratorAppUrl}/${endpoint}/scheduler-config/${pID}/${regionCode}`;
  const requestOption = requestOptionsWithoutCookie('delete', url);
  return axios(requestOption)
      .then(function(resp) {
        console.log(resp);
        resp.data = {errorMsg: null, success: true};
        return resp.data;
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};


const updateWahooActivation = async (pID, reasonForChange, context)=>{
  const changedBy = context.user.email;
  const url = `${configGeneratorAppUrl}/${endpoint}/activation/activate`;

  const ddsPayload = {
    partnerId: pID, changedBy,
    reasonForChange,
  };
  const requestOption = requestOptionsWithoutCookie('post', url);
  requestOption.data = ddsPayload;
  return axios(requestOption)
      .then(function(resp) {
        if (resp.data) {
          resp.data = {success: true, errorMsg: ''};
          return resp.data;
        }
        throw new ApolloError(JSON.stringify("Failed to activate"), 500, resp.data);
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};

const getWahooActivation = (pID) => {
  const url = `${configGeneratorAppUrl}/${endpoint}/activation/status/${pID}`;
  const requestOption = requestOptionsWithoutCookie('get', url);
  return axios(requestOption)
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};

const deleteWahoo = async (pID, reasonForChange, context)=>{
  const changedBy = context.user.email;
  const partnerId = pID;
  try {
    await deleteWahooFromDDS(partnerId, changedBy, reasonForChange,);
  } catch (e) {
    return {success: false, errorMsg: e.message};
  }
  return {success: true, errorMsg: null};
};

const deleteWahooFromDDS = async (partnerId, changedBy, reasonForChange,)=>{
  const ddsPayload = {
    partnerId, changedBy, reasonForChange,
  };
  const url = `${configGeneratorAppUrl}/${endpoint}/activation`;
  const requestOption = requestOptionsWithoutCookie('DELETE', url);
  requestOption.data = ddsPayload;
  return axios(requestOption)
      .then(async function(resp) {
        console.log(resp);
        return resp.data;
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};

const addUpdatePrivacySettings = async (privacySettings, context)=>{
  const url = `${configGeneratorAppUrl}/privacy/optout/settings`;
  const requestOption = requestOptionsWithoutCookie('post', url);
  requestOption.data = privacySettings;
  return axios(requestOption)
      .then(function(resp) {
        console.log(resp);
        resp.data = {errorMsg: null, success: true};
        return resp.data;
      })
      .catch(function(error) {
        console.log(error)
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};

const getPrivacySettings = (partnerId) => {
  const url = `${configGeneratorAppUrl}/privacy/optout/settings/${partnerId}`;
  const requestOption = requestOptionsWithoutCookie('get', url);
  return axios(requestOption)
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(error) {
        throw new ApolloError(JSON.stringify(error.response.data.message), error.response.status, error.response.data);
      });
};



module.exports = {
  getWahooDataGenericFn,
  addUpdateDataFrequency,
  getWahooRegionsDataGenericFn,
  deleteDataFrequencyByRegion,
  saveIdCodec,
  updateDataPartitionConfig,
  updateDataFilenameConfig,
  updateWahooActivation,
  getWahooActivation,
  deleteWahoo,
  addUpdatePrivacySettings,
  getPrivacySettings,
};
