/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */

import moment from 'moment';
import querystring from 'querystring';
import Bugsnag from '@bugsnag/react-native';
import { getAuthHeader, AUTH_ERROR_CODES } from 'sussol-utilities';

import { UIDatabase } from '../database';
import { createRecord, parseBoolean, parseDate, parseNumber } from '../database/utilities';
import { SETTINGS_KEYS } from '../settings/index';

const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  EMPTY_RESPONSE: 'No records found',
};

const RESOURCES = {
  PATIENT: '/api/v4/patient',
  PRESCRIBER: '/api/v4/prescriber',
  NAME_STORE_JOIN: '/api/v4/name_store_join',
};

const TYPES = {
  STRING: 'string',
  DATE: 'date',
};

const PARAMETERS = {
  firstName: { key: 'first_name', type: TYPES.STRING },
  lastName: { key: 'last_name', type: TYPES.STRING },
  dateOfBirth: { key: 'dob', type: TYPES.DATE },
  policyNumber: { key: 'policy_number', type: TYPES.STRING },
  registrationCode: { key: 'code', type: TYPES.STRING },
};

class BugsnagError extends Error {
  constructor(message, data, ...args) {
    super(message, ...args);
    Bugsnag.notify(this, report => {
      report.errorMessage = message;
      report.metadata = data;
    });
  }
}

export const getServerURL = () => UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL);

export const getAuthorizationHeader = () => {
  const username = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const password = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH);
  return getAuthHeader(username, password);
};

export const createPatientRecord = patient => {
  patient?.policies?.forEach(createPolicyRecord);
};

export const createPolicyRecord = policy => {
  const { nameId, enteredById, insuranceProviderId } = policy;
  const enteredBy = UIDatabase.getOrCreate('User', enteredById);
  const patient = UIDatabase.getOrCreate('Name', nameId);
  const insuranceProvider = UIDatabase.getOrCreate('InsuranceProvider', insuranceProviderId);
  const policyRecord = { ...policy, enteredBy, patient, insuranceProvider };
  UIDatabase.write(() => createRecord(UIDatabase, 'InsurancePolicy', policyRecord));
};

const getQueryString = params => {
  const query = params.reduce((queryObject, param) => {
    const [[key, value], [, type]] = Object.entries(param);
    if (!value) return queryObject;
    const paramValue = type !== TYPES.DATE ? `@${value}@` : moment(value).format('DDMMYYYY');
    return { ...queryObject, [key]: paramValue };
  }, {});
  return `?${querystring.stringify(query)}`;
};

const getPrescriberQueryString = ({ firstName = '', lastName = '', registrationCode = '' }) => {
  const queryParams = [
    { [PARAMETERS.firstName.key]: firstName, type: PARAMETERS.firstName.type },
    { [PARAMETERS.lastName.key]: lastName, type: PARAMETERS.lastName.type },
    { [PARAMETERS.registrationCode.key]: registrationCode, type: PARAMETERS.registrationCode.type },
  ];
  return getQueryString(queryParams);
};

const getPatientQueryString = ({
  firstName = '',
  lastName = '',
  dateOfBirth = '',
  policyNumber = '',
} = {}) => {
  const queryParams = [
    { [PARAMETERS.firstName.key]: firstName, type: PARAMETERS.firstName.type },
    { [PARAMETERS.lastName.key]: lastName, type: PARAMETERS.lastName.type },
    { [PARAMETERS.dateOfBirth.key]: dateOfBirth, type: PARAMETERS.dateOfBirth.type },
    { [PARAMETERS.policyNumber.key]: policyNumber, type: PARAMETERS.policyNumber.type },
  ];
  return getQueryString(queryParams);
};

export const getPatientRequestUrl = params => {
  const endpoint = RESOURCES.PATIENT;
  const queryString = getPatientQueryString(params);
  return endpoint + queryString;
};

export const getPrescriberRequestUrl = params => {
  const endpoint = RESOURCES.PRESCRIBER;
  const queryString = getPrescriberQueryString(params);
  return endpoint + queryString;
};

const processInsuranceResponse = response =>
  response.map(
    ({
      ID: id,
      insuranceProviderID: insuranceProviderId,
      nameID: nameId,
      policyNumberFamily,
      policyNumberPerson,
      discountRate,
      expiryDate,
      isActive,
      enteredByID: enteredById,
      type,
    }) => ({
      id,
      insuranceProviderId,
      nameId,
      policyNumberFamily,
      policyNumberPerson,
      discountRate: parseNumber(discountRate),
      expiryDate: parseDate(expiryDate),
      isActive: parseBoolean(isActive),
      enteredById,
      type,
    })
  );

const processResponse = response => {
  const { ok, status, url, headers, json } = response;
  if (ok) {
    const { error: responseError } = json;
    if (responseError) throw new BugsnagError(responseError, { url, headers });
    if (!json.length) throw new Error(ERROR_CODES.EMPTY_RESPONSE);
    return json;
  }
  switch (status) {
    case 400:
    default:
      throw new Error(ERROR_CODES.CONNECTION_FAILURE);
    case 401:
      throw new BugsnagError(ERROR_CODES.INVALID_PASSWORD, { url, headers });
  }
};

export const processPatientResponse = response => {
  const result = processResponse(response);
  return result.map(
    ({
      ID: id,
      name,
      code,
      phone: phoneNumber,
      bill_address1: billAddress1,
      bill_address2: billAddress2,
      bill_address3: billAddress3,
      bill_address4: billAddress4,
      bill_postal_zip_code: billPostalZipCode,
      email: emailAddress,
      supplying_store_id: supplyingStoreId,
      first: firstName,
      last: lastName,
      date_of_birth,
      nameInsuranceJoin,
    }) => ({
      id,
      name,
      code,
      phoneNumber,
      billAddress1,
      billAddress2,
      billAddress3,
      billAddress4,
      billPostalZipCode,
      emailAddress,
      supplyingStoreId,
      firstName,
      lastName,
      dateOfBirth: parseDate(date_of_birth),
      policies: processInsuranceResponse(nameInsuranceJoin),
    })
  );
};

export const processPrescriberResponse = response =>
  processResponse(response).map(
    ({
      ID,
      first_name,
      last_name,
      registration_code,
      address1,
      address2,
      phone,
      mobile,
      email,
      store_ID,
    }) => ({
      id: ID,
      firstName: first_name,
      lastName: last_name,
      registrationCode: registration_code,
      address1,
      address2,
      phoneNumber: phone,
      mobileNumber: mobile,
      emailAddress: email,
      storeId: store_ID,
    })
  );

export const createPatientVisibility = async name => {
  const thisStoreID = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_ID);
  const { id: nameID } = name;

  const nameExists = UIDatabase.get('Name', nameID);

  if (nameExists) return true;

  const body = { store_ID: thisStoreID, name_ID: nameID };

  try {
    const response = await fetch(`${getServerURL()}${RESOURCES.NAME_STORE_JOIN}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        authorization: getAuthorizationHeader(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return response.status === 200;
  } catch {
    // If there was an error, just return false
    return false;
  }
};
