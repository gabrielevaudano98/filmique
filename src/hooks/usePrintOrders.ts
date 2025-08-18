import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, PrintOrder } from '../types';
import { showErrorToast, showSuccessToast } from '../utils/toasts';

export const usePrintOrders = (profile: UserProfile | null) => {
  const [printOrders, setPrintOrders] = useState<PrintOrder[]>([]);

  const fetchPrintOrders = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await api.fetchPrintOrders(profile.id);
    if (error) {
      showErrorToast('Failed to fetch print orders.');
    } else {
      setPrintOrders(data as PrintOrder[]);
    }
  }, [profile]);

  const cancelPrintOrder = useCallback(async (orderId: string) => {
    if (!profile) return;
    const { error } = await api.cancelPrintOrder(orderId);
    if (error) {
      showErrorToast(`Failed to cancel order: ${error.message}`);
    } else {
      showSuccessToast('Order canceled and credits refunded.');
      fetchPrintOrders(); // Refresh the list
    }
  }, [profile, fetchPrintOrders]);

  return {
    printOrders,
    fetchPrintOrders,
    cancelPrintOrder,
  };
};