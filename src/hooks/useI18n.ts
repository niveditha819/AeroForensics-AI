import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';

export type Lang = 'en' | 'hi' | 'kn';

const FALLBACK: Record<string, Record<Lang, string>> = {
  appTitle: { en: 'AeroForensics AI', hi: 'एयरोफोरेंसिक्स AI', kn: 'ಎಯರೋಫೊರೆನ್ಸಿಕ್ಸ್ AI' },
  liveTelemetry: { en: 'Live Telemetry', hi: 'लाइव टेलीमेट्री', kn: 'ನೇರ ಪ್ರಸಾರ ಟೆಲಿಮೆಟ್ರಿ' },
  triggerAnomaly: { en: 'Trigger Live Anomaly', hi: 'लाइव एनॉमली ट्रिगर करें', kn: 'ನೇರ ಅಸ್ವಾಭಾವಿಕತೆ ಪ್ರಾರಂಭಿಸಿ' },
  historicalArchive: { en: 'Historical Archive', hi: 'ऐतिहासिक अभिलेखागार', kn: 'ಐತಿಹಾಸಿಕ ಕACHIVE' },
  anomalyAlerts: { en: 'Anomaly Alerts', hi: 'एनॉमली अलर्ट्स', kn: 'ಅಸ್ವಾಭಾವಿಕತೆ ಎಚ್ಚರಿಕೆಗಳು' },
  markAllRead: { en: 'Mark All as Read', hi: 'सभी को पढ़ा हुआ चिह्नित करें', kn: 'ಎಲ್ಲವನ್ನು ಓದಿದೆ ಎಂದು ಗುರುತಿಸಿ' },
  viewAllArchive: { en: 'View All in Archive', hi: 'अभिलेखागार में सभी देखें', kn: 'ARCHIVE ನಲ್ಲಿ ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' },
  noAlerts: { en: 'No alerts', hi: 'कोई अलर्ट नहीं', kn: 'ಯಾವುದೇ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ' },
  critical: { en: 'critical', hi: 'गंभीर', kn: 'ಗಂಭೀರ' },
  warning: { en: 'warning', hi: 'चेतावनी', kn: 'ಎಚ್ಚರಿಕೆ' },
  resolved: { en: 'resolved', hi: 'हल किया गया', kn: 'ಪರಿಹರಿಸಲಾಗಿದೆ' },
  pending: { en: 'pending', hi: 'लंबित', kn: 'ಬಾಕಿ' },
  active: { en: 'active', hi: 'सक्रिय', kn: 'ಸಕ್ರಿಯ' },
  dispatchUnit: { en: 'Dispatch Unit & Generate Legal Evidence Packet', hi: 'यूनिट भेजें और कानूनी सबूत पैकेट तैयार करें', kn: 'ಯೂನಿಟ್ ಕಳುಹಿಸಿ ಮತ್ತು ಕಾನೂನುಬದ್ಧ ಸಾಕ್ಷ್ಯ ಪ್ಯಾಕೇಟ್ ರಚಿಸಿ' },
  unitDispatched: { en: 'Unit Dispatched — Evidence Packet Generated', hi: 'यूनिट भेज दी गई — सबूत पैकेट तैयार', kn: 'ಯೂನಿಟ್ ಕಳುಹಿಸಲಾಗಿದೆ — ಸಾಕ್ಷ್ಯ ಪ್ಯಾಕೇಟ್ ರಚಿಸಲಾಗಿದೆ' },
  downloadEvidence: { en: 'Download Evidence Packet', hi: 'सबूत पैकेट डाउनलोड करें', kn: 'ಸಾಕ್ಷ್ಯ ಪ್ಯಾಕೇಟ್ ಡೌನ್ಲೋಡ್ ಮಾಡಿ' },
  export: { en: 'Export', hi: 'निर्यात करें', kn: 'ರಫ್ತು ಮಾಡಿ' },
  exportSelected: { en: 'Export Selected', hi: 'चयनित निर्यात करें', kn: 'ಆಯ್ಕೆ ಮಾಡಿದವನ್ನು ರಫ್ತು ಮಾಡಿ' },
  clear: { en: 'Clear', hi: 'साफ़ करें', kn: 'ಅಳಿಸಿ' },
  searchPlaceholder: { en: 'Search by ID, sensor, source, or type...', hi: 'आईडी, सेंसर, स्रोत या प्रकार से खोजें...', kn: 'ID, ಸೆನ್ಸಾರ್, ಮೂಲ, ಅಥವಾ ಪ್ರಕಾರದ ಮೂಲಕ ಹುಡುಕಿ...' },
  filters: { en: 'Filters', hi: 'फ़िल्टर', kn: 'ಶೋಧಕಗಳು' },
  allSeverities: { en: 'All Severities', hi: 'सभी गंभीरता स्तर', kn: 'ಎಲ್ಲಾ ಗಂಭೀರತೆ' },
  allStatuses: { en: 'All Statuses', hi: 'सभी स्थितियाँ', kn: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು' },
  recordsFound: { en: 'records found', hi: 'रिकॉर्ड मिले', kn: 'ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿವೆ' },
  noRecordsFound: { en: 'No Records Found', hi: 'कोई रिकॉर्ड नहीं मिला', kn: 'ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  adjustSearch: { en: 'Try adjusting your search or filters.', hi: 'अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें।', kn: 'ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸರಿಹೊಂದಿಸಲು ಪ್ರಯತ್ನಿಸಿ।' },
  evidenceLocker: { en: 'Evidence Locker', hi: 'सबूत लॉकर', kn: 'ಸಾಕ್ಷ್ಯ ಲಾಕರ್' },
  chemicalScan: { en: 'Chemical Scan', hi: 'रासायनिक स्कैन', kn: 'ರಾಸಾಯನಿಕ ಸ್ಕ್ಯಾನ್' },
  thermalSignature: { en: 'Thermal Signature', hi: 'थर्मल हस्ताक्षर', kn: 'ತಾಪ ಸಹಿ' },
  windHistory: { en: 'Wind History', hi: 'पवन इतिहास', kn: 'ಗಾಳಿ ಇತಿಹಾಸ' },
  stability: { en: 'Stability', hi: 'स्थिरता', kn: 'ಸ್ಥಿರತೆ' },
  anomalyShield: { en: 'Anomaly Shield Active', hi: 'एनॉमली शील्ड सक्रिय', kn: 'ಅಸ್ವಾಭಾವಿಕತೆ ಡಾಲು ಸಕ್ರಿಯ' },
  collaborationRooms: { en: 'Collaboration Rooms', hi: 'सहयोग कक्ष', kn: 'ಸಹಕಾರ ಕೋಣೆಗಳು' },
  createRoom: { en: 'Create Room', hi: 'कक्ष बनाएँ', kn: 'ಕೋಣೆ ರಚಿಸಿ' },
  send: { en: 'Send', hi: 'भेजें', kn: 'ಕಳುಹಿಸಿ' },
  typeMessage: { en: 'Type a message...', hi: 'संदेश लिखें...', kn: 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...' },
  participants: { en: 'Participants', hi: 'प्रतिभागी', kn: 'ಭಾಗವಹಿಸುವವರು' },
  trendTitle: { en: 'Anomaly Trend (Last 14 Days)', hi: 'एनॉमली रुझान (पिछले 14 दिन)', kn: 'ಅಸ್ವಾಭಾವಿಕತೆ ಪ್ರವೃತ್ತಿ (ಕಳೆದ 14 ದಿನಗಳು)' },
  live: { en: 'Live', hi: 'लाइव', kn: 'ನೇರ' },
  so2: { en: 'SO₂', hi: 'SO₂', kn: 'SO₂' },
  pm25: { en: 'PM2.5', hi: 'PM2.5', kn: 'PM2.5' },
  nox: { en: 'NOx', hi: 'NOx', kn: 'NOx' },
  temperature: { en: 'Temperature', hi: 'तापमान', kn: 'ತಾಪಮಾನ' },
  windSpeed: { en: 'Wind Speed', hi: 'पवन गति', kn: 'ಗಾಳಿ ವೇಗ' },
  windDir: { en: 'Wind Direction', hi: 'पवन दिशा', kn: 'ಗಾಳಿ ದಿಕ್ಕು' },
};

export function useI18n() {
  const [lang, setLang] = useState<Lang>('en');
  const [dict, setDict] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('translations').select('key, value').eq('language', lang);
      const loaded: Record<string, string> = {};
      for (const row of data ?? []) {
        loaded[row.key] = row.value;
      }
      setDict(loaded);
    };
    load();
  }, [lang]);

  const t = useCallback(
    (key: string) => {
      return dict[key] || FALLBACK[key]?.[lang] || key;
    },
    [dict, lang]
  );

  return { lang, setLang, t };
}
