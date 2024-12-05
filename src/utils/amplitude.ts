import * as amplitude from '@amplitude/analytics-browser';
import { Types } from '@amplitude/analytics-browser';

const getApiKey = () => {
  return window.location.hostname === 'bob.ansatt.nav.no'
    ? '24311e1f03646352192aadd7b6fa08af'
    : '5560833e366c2488459da9762e892aa4';
};

type AmplitudeInstance = Pick<Types.BrowserClient, 'logEvent' | 'identify'>;
const createAmpltiudeInstance = (): AmplitudeInstance => {
  amplitude
    .init(getApiKey(), undefined, {
      serverUrl: 'https://amplitude.nav.no/collect',
      useBatch: false,
      autocapture: {
        attribution: true,
        fileDownloads: false,
        formInteractions: false,
        pageViews: true,
        sessions: true,
        elementInteractions: false,
      },
    })
    .promise.catch((error) => {
      console.error('#MSA error initializing amplitude', error);
    });
  return amplitude;
};

const mockedAmplitude = (): AmplitudeInstance => ({
  logEvent: (eventInput: Types.BaseEvent | string, eventProperties?: Record<string, any>) => {
    console.group('Mocked amplitude-event');
    console.table({ eventInput, ...eventProperties });
    console.groupEnd();
    return {
      promise: new Promise<Types.Result>((resolve) =>
        resolve({
          event: { event_type: 'MockEvent' },
          code: 200,
          message: 'Success: mocked amplitude-tracking',
        })
      ),
    };
  },
  identify(
    identify: Types.Identify,
    _?: Types.EventOptions
  ): Types.AmplitudeReturn<Types.Result> {
    console.group('Mocked amplitude-identify');
    console.table(identify);
    console.groupEnd();
    return {
      promise: new Promise<Types.Result>((resolve) =>
        resolve({
          event: { event_type: 'MockIdentify' },
          code: 200,
          message: 'Success: mocked amplitude-identify',
        })
      ),
    };
  },
});

export default createAmpltiudeInstance()
