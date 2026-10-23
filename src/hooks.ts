import { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';

/** Vangt de terugknop van Android op zolang de component getoond wordt. */
export function useBackHandler(handler: () => boolean) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [handler]);
}

export function confirmExit(onExit: () => void) {
  Alert.alert('Stoppen?', 'Je voortgang in deze oefening gaat verloren.', [
    { text: 'Doorgaan', style: 'cancel' },
    { text: 'Stoppen', style: 'destructive', onPress: onExit },
  ]);
}
