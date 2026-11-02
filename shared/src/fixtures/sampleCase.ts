import { CaseDocument } from '../schemas/case.schema.js';

export const SAMPLE_CASE: CaseDocument = {
  caseId: 'b4b1a45c-204f-4d92-8ec2-7bc0516641b9',
  status: 'ready',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  premise:
    'During the midnight gala at the Obsidian Contemporary Art Gallery, the rare diamond-encrusted sculpture "Vespera" was stolen from the high-security vault. Only three key individuals possessed the biometric clearance or security codes.',
  settings: {
    genre: 'contemporary mystery',
    difficulty: 'medium',
    evidenceTypes: ['messages', 'cctv', 'forensics', 'document']
  },
  title: 'The Obsidian Gallery Vault Heist',
  synopsis:
    'The gallery lights flickered at 23:48 PM during the annual gala. Ten minutes later, the display pedestal was empty, the laser grid was bypassed cleanly, and the emergency alarms had been silently suppressed.',
  suspects: [
    {
      suspectId: 'suspect-1',
      name: 'Evelyn Vance',
      role: 'Chief Curator',
      profile:
        'A distinguished art historian who curated the Vespera exhibition. Deeply protective of the gallery’s reputation, but rumors suggest she was facing catastrophic personal debt from private art speculations.',
      motive: 'Desperation to settle an impending $2M margin call on her private collection.',
      alibi: 'Claims she was on the VIP rooftop terrace having champagne and speaking on a video call.',
      publicTimeline: 'Seen at the gallery entrance at 23:00, then walked up to the rooftop terrace around 23:35.'
    },
    {
      suspectId: 'suspect-2',
      name: 'Marcus Drake',
      role: 'Head of Security & Systems',
      profile:
        'A cynical veteran security architect who designed the gallery’s electronic countermeasures. Recently had his annual performance bonus slashed by the board.',
      motive: 'Bitter grievance over denied equity and underpaid overtime.',
      alibi: 'Claims he was in the basement server hub diagnosing anomalous power fluctuations from 23:40 to 00:10.',
      publicTimeline: 'Logged entering the basement server room at 23:38; did not emerge until security sirens triggered at 00:12.'
    },
    {
      suspectId: 'suspect-3',
      name: 'Julian Sterling',
      role: 'Billionaire Collector & Board Trustee',
      profile:
        'An eccentric tycoon renowned for acquiring unobtainable masterpieces. He attempted to purchase Vespera privately three weeks ago, but the original donor refused.',
      motive: 'Obsessive desire to possess the one artifact his fortune could not legitimately buy.',
      alibi: 'Claims he was chatting with benefactors near the catering lounge continuously until midnight.',
      publicTimeline: 'Arrived by chauffeur at 23:20; seen circulating near the east wing and private salon.'
    }
  ],
  evidence: [
    {
      evidenceId: 'ev-1',
      type: 'messages',
      title: 'Intercepted Encrypted Chat Log',
      description: 'A WhatsApp-style chat export recovered from a burner device near the staff entrance.',
      content:
        '[23:14] Unknown: "Is the proxy keycard ready?"\n[23:18] Contact-X: "Yes. Cloned the RFID frequency in the lobby. Access window is exactly 23:45 to 23:55 while the secondary loop resets."\n[23:22] Unknown: "Clean job. The buyer is waiting at the south marina."',
      inWorldTimestamp: '23:14 - 23:22',
      sourceLabel: 'Metropolitan Police Cybercrime Division',
      relatedSuspectIds: ['suspect-2', 'suspect-3'],
      relatedTimelineEventIds: ['tl-2'],
      isRedHerring: false
    },
    {
      evidenceId: 'ev-2',
      type: 'cctv',
      title: 'Corridor CCTV Still Frame & Sensor Log',
      description: 'Timestamped corridor surveillance frame and thermal detection register.',
      content:
        'CCTV Transcript Summary:\n- 23:46:20: Main corridor camera feeds flicker with synthetic static overlay for 180 seconds.\n- 23:49:15: Infrared sensor detects a figure wearing a tailored tuxedo and a dark velvet overcoat approaching the vault door.\n- 23:50:02: Vault door unlocks via master PIN override. Figure exits vault 84 seconds later concealing an object inside an inner pocket.',
      inWorldTimestamp: '23:46 - 23:52',
      sourceLabel: 'Building Automated Surveillance Archive',
      relatedSuspectIds: ['suspect-1', 'suspect-3'],
      relatedTimelineEventIds: ['tl-3'],
      isRedHerring: false
    },
    {
      evidenceId: 'ev-3',
      type: 'forensics',
      title: 'Crime Scene Keypad Chemical Swab Report',
      description: 'Forensic chemical report from the vault keypad and exterior door handle.',
      content:
        'Laboratory Findings:\n1. Keypad Buttons [2-7-9-0]: Detected microscopic traces of palladium-platinum metallic dust, matching the metallurgical composition of high-end bespoke jewelry.\n2. Exterior Handle: Trace fibers of mulberry silk velvet (Navy blue).\nNote: Marcus Drake does not wear jewelry. Julian Sterling is documented wearing a custom platinum-palladium signet ring on his right hand.',
      inWorldTimestamp: '01:30 Post-Incident',
      sourceLabel: 'Forensic Identification Unit',
      relatedSuspectIds: ['suspect-3'],
      relatedTimelineEventIds: ['tl-3'],
      isRedHerring: false
    },
    {
      evidenceId: 'ev-4',
      type: 'document',
      title: 'Rooftop Lounge Witness & Telecom Verification',
      description: 'Telecom provider cell-tower ping data and hotel video-call transcript for Evelyn Vance.',
      content:
        'Verified Carrier Log:\nEvelyn Vance was connected to an uninterrupted high-definition FaceTime call with an overseas auction representative from 23:42 until 00:08 from the gallery rooftop IP address. Multiple gala attendees verified her physical presence on the terrace holding her phone throughout the call.',
      inWorldTimestamp: '23:42 - 00:08',
      sourceLabel: 'Telecom Carrier Records & Gala Witness Statements',
      relatedSuspectIds: ['suspect-1'],
      relatedTimelineEventIds: ['tl-2', 'tl-3'],
      isRedHerring: false
    },
    {
      evidenceId: 'ev-5',
      type: 'cctv',
      title: 'Server Hub Access Log & Diagnostic Journal',
      description: 'Terminal session audit from the internal security room.',
      content:
        'System Console Audit:\n- 23:41:04: Marcus Drake logged into the physical root terminal.\n- 23:44:12: Drake initiated diagnostic test #884 to isolate network packet loss.\n- 23:48:30: Drake typed active command line queries attempting to regain camera feed telemetry until 00:05.\nKeystroke timings prove continuous physical presence at the terminal.',
      inWorldTimestamp: '23:41 - 00:05',
      sourceLabel: 'Security Server Internal Syslog',
      relatedSuspectIds: ['suspect-2'],
      relatedTimelineEventIds: ['tl-2', 'tl-3'],
      isRedHerring: false
    },
    {
      evidenceId: 'ev-6',
      type: 'document',
      title: 'Discarded Silk Velvet Scarf (Terrace Stairwell)',
      description: 'A blue velvet accessory found near the emergency stairs.',
      content:
        'Recovered Item: An expensive blue velvet evening scarf belonging to Evelyn Vance. Found dropped on the service stairs between the terrace and first floor. Initial suspicion suggested she used the stairs to reach the vault, but telecom records confirm she never left the terrace call.',
      inWorldTimestamp: '00:45 Post-Incident',
      sourceLabel: 'Crime Scene Evidence Tag #402',
      relatedSuspectIds: ['suspect-1'],
      relatedTimelineEventIds: ['tl-1'],
      isRedHerring: true
    }
  ],
  timeline: [
    {
      eventId: 'tl-1',
      timestamp: '23:20',
      description: 'Julian Sterling arrives at the gallery gala; guests gather in the main reception salon.',
      relatedSuspectIds: ['suspect-3'],
      relatedEvidenceIds: []
    },
    {
      eventId: 'tl-2',
      timestamp: '23:42',
      description:
        'Evelyn Vance begins an uninterrupted video call on the terrace; Marcus Drake logs into the server room to trace a signal dropout.',
      relatedSuspectIds: ['suspect-1', 'suspect-2'],
      relatedEvidenceIds: ['ev-4', 'ev-5']
    },
    {
      eventId: 'tl-3',
      timestamp: '23:50',
      description:
        'The vault override keypad is operated by an individual wearing a platinum ring; Vespera sculpture is removed from its pedestal.',
      relatedSuspectIds: ['suspect-3'],
      relatedEvidenceIds: ['ev-2', 'ev-3']
    },
    {
      eventId: 'tl-4',
      timestamp: '00:12',
      description: 'Security alarm sounds after scheduled auto-reboot of the primary sensor grid; police arrive on scene.',
      relatedSuspectIds: ['suspect-1', 'suspect-2', 'suspect-3'],
      relatedEvidenceIds: []
    }
  ],
  solution: {
    culpritSuspectId: 'suspect-3',
    motive:
      'Julian Sterling was obsessed with possessing Vespera after his formal acquisition offer was rejected. He orchestrated a sophisticated insider theft during the gala.',
    method:
      'Sterling procured a cloned RFID proxy and used the manual override code on the vault keypad. The forensic swab revealed palladium-platinum metallic transfer from his custom signet ring on the keypad buttons, while the other suspects had ironclad electronic alibis.',
    summary:
      'Julian Sterling used his cloned credentials and insider knowledge to enter the vault at 23:50. He assumed Marcus would be blamed for the system dropout and Evelyn for her financial troubles, but the forensic evidence on the keypad and verified telecom alibis irrevocably point to him.',
    decisiveEvidenceIds: ['ev-3', 'ev-4', 'ev-5'],
    alternativeEliminations: [
      {
        suspectId: 'suspect-1',
        reason:
          'Evelyn Vance had an ironclad telecom carrier and eyewitness alibi on an active video call from 23:42 to 00:08 (ev-4). The velvet scarf was a red herring dropped earlier in the evening.'
      },
      {
        suspectId: 'suspect-2',
        reason:
          'Continuous physical keystroke logs at the server terminal confirm Marcus Drake was working in the basement throughout the heist window (ev-5).'
      }
    ]
  },
  hints: [
    {
      hintId: 'hint-1',
      level: 1,
      title: 'Check the Alibis Carefully',
      text: 'Look at the timestamped electronic logs for Evelyn Vance and Marcus Drake during the critical 23:45–23:55 window. Can either of them physically be in two places at once?'
    },
    {
      hintId: 'hint-2',
      level: 2,
      title: 'Analyze the Keypad Forensics',
      text: 'The chemical swab on the vault keypad found microscopic traces of palladium-platinum dust. Cross-reference this metallurgical finding with the jewelry worn by the suspects.'
    },
    {
      hintId: 'hint-3',
      level: 3,
      title: 'Eliminate the Red Herrings',
      text: 'The blue velvet fibers appeared to implicate Evelyn Vance, but carrier records prove her video call was active without interruption. Focus on who had both the ring residue and an unaccounted window.'
    }
  ],
  unlockedHintLevels: [],
  submission: null,
  generation: {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    promptVersion: '1.0.0',
    schemaVersion: '1.0.0',
    attempts: 1,
    validationStatus: 'passed'
  }
};
