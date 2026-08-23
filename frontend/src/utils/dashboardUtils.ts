import { RiskLevelData } from '../types/dashboard';

export const riskDataToPercentages = (data: RiskLevelData): {
  muyAlto: number;
  alto: number;
  medio: number;
  bajo: number;
  sinRiesgo: number;
} => {
  const total = data.total || 1;
  return {
    muyAlto: Math.round((data.muyAlto / total) * 100),
    alto: Math.round((data.alto / total) * 100),
    medio: Math.round((data.medio / total) * 100),
    bajo: Math.round((data.bajo / total) * 100),
    sinRiesgo: Math.round((data.sinRiesgo / total) * 100),
  };
};
export const addRiskData = (a: RiskLevelData, b: RiskLevelData): RiskLevelData => {
  return {
    name: a.name,
    muyAlto: (a.muyAlto || 0) + (b.muyAlto || 0),
    alto: (a.alto || 0) + (b.alto || 0),
    medio: (a.medio || 0) + (b.medio || 0),
    bajo: (a.bajo || 0) + (b.bajo || 0),
    sinRiesgo: (a.sinRiesgo || 0) + (b.sinRiesgo || 0),
    total: (a.total || 0) + (b.total || 0),
  };
};
