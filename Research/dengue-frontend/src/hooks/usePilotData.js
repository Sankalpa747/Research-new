import { useState, useEffect } from 'react';
import { pilotAPI } from '../services/api';

/**
 * Hook for managing pilot study data
 * Provides GN options, full GN list, and pilot configuration
 */
export const usePilotData = () => {
  const [gnOptions, setGnOptions] = useState([]);
  const [gnList, setGnList] = useState([]);
  const [pilotConfig, setPilotConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPilotData();
  }, []);

  const loadPilotData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all pilot data in parallel
      const [optionsRes, listRes, configRes] = await Promise.all([
        pilotAPI.getGNOptions(),
        pilotAPI.getGNList(), 
        pilotAPI.getConfig()
      ]);

      setGnOptions(optionsRes.data);
      setGnList(listRes.data.gn_divisions);
      setPilotConfig(configRes.data.config);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load pilot data');
      console.error('Error loading pilot data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getGNByCode = (gnCode) => {
    return gnList.find(gn => gn.gn_code === gnCode);
  };

  const getGNOption = (gnCode) => {
    return gnOptions.find(option => option.value === gnCode);
  };

  const isValidGN = (gnCode) => {
    return gnOptions.some(option => option.value === gnCode);
  };

  return {
    gnOptions,
    gnList,
    pilotConfig,
    loading,
    error,
    reload: loadPilotData,
    // Helper functions
    getGNByCode,
    getGNOption,
    isValidGN
  };
};

/**
 * Hook specifically for GN options (lighter weight)
 * Use this if you only need dropdown options
 */
export const useGNOptions = () => {
  const [gnOptions, setGnOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGNOptions();
  }, []);

  const loadGNOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pilotAPI.getGNOptions();
      setGnOptions(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load GN options');
      console.error('Error loading GN options:', err);
    } finally {
      setLoading(false);
    }
  };

  const isValidGN = (gnCode) => {
    return gnOptions.some(option => option.value === gnCode);
  };

  const getGNLabel = (gnCode) => {
    const option = gnOptions.find(opt => opt.value === gnCode);
    return option ? option.label : gnCode;
  };

  return {
    gnOptions,
    loading,
    error,
    reload: loadGNOptions,
    isValidGN,
    getGNLabel
  };
};