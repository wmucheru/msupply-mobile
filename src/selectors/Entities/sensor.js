import { selectSpecificEntityState } from './index';

export const selectSensorState = state => selectSpecificEntityState(state, 'sensor');

export const selectSensorsById = state => {
  const sensorState = selectSensorState(state);
  const { byId } = sensorState;
  return byId;
};

export const selectNewSensor = state => {
  const sensorState = selectSensorState(state);
  const { newId, byId } = sensorState;
  return byId[newId];
};

export const selectEditingSensor = state => {
  const sensorState = selectSensorState(state);
  const { editingId, byId } = sensorState;
  return byId[editingId];
};

export const selectNewSensorId = state => {
  const sensorState = selectSensorState(state);
  const { newId } = sensorState;

  return newId;
};

export const selectSensors = state => {
  const sensorsById = selectSensorsById(state);
  return Object.values(sensorsById);
};
