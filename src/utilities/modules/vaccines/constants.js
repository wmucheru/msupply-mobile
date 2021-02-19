/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

const DOMAIN_OFFSET = 3;
const AXIS_OFFSET = 50;
const STROKE_WIDTH = 2;
const STROKE_SIZE = 3;
const INTERPOLATION = 'catmullRom';
const MAX_DATA_POINTS = 30;
const MAX_TICK_COUNTS = 15;
const MAX_LOGGING_INTERVAL_MINUTES = 10;
const MIN_LOGGING_INTERVAL_MINUTES = 1;
const MAX_LOGGING_DELAY_MINUTES = 30;
const LOW_BATTERY_PERCENTAGE = 25;
const DEFAULT_LOGGING_DELAY_MINUTES = 5;

const SENSOR_LOGS_PER_TEMPERATURE_LOG = 6;
const MAX_BLUETOOTH_COMMAND_ATTEMPTS = 10;

export const VACCINE_CONSTANTS = {
  SENSOR_LOGS_PER_TEMPERATURE_LOG,
  MAX_BLUETOOTH_COMMAND_ATTEMPTS,
  MAX_LOGGING_INTERVAL_MINUTES,
  MIN_LOGGING_INTERVAL_MINUTES,
  LOW_BATTERY_PERCENTAGE,
  MAX_LOGGING_DELAY_MINUTES,
  DEFAULT_LOGGING_DELAY_MINUTES,
};

export const CHART_CONSTANTS = {
  DOMAIN_OFFSET,
  AXIS_OFFSET,
  STROKE_SIZE,
  STROKE_WIDTH,
  INTERPOLATION,
  MAX_DATA_POINTS,
  MAX_TICK_COUNTS,
};

export const VACCINE_ENTITIES = {
  LOCATION: 'Location',
  SENSOR: 'Sensor',
  TEMPERATURE_LOG: 'TemperatureLog',
  TEMPERATURE_BREACH: 'TemperatureBreach',
  TEMPERATURE_BREACH_CONFIGURATION: 'TemperatureBreachConfiguration',
  SENSOR_LOG: 'SensorLog',
};

export const DOWNLOADING_ERROR_CODES = {
  E_INVALID_MAC_FORMAT: 'E_INVALID_MAC_FORMAT',
  E_CANT_CONNECT: 'E_CANT_CONNECT',
  E_CANT_SAVE: 'E_CANT_SAVE',
  E_UNKNOWN: 'E_UNKNOWN',
};

export const LAST_DOWNLOAD_STATUS = {
  OK: 'OK',
  ERROR: 'ERROR',
};
