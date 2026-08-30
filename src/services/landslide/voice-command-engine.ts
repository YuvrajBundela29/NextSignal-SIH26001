export interface TacticalCommandResult {
  matched: boolean;
  intent: string;
  transcript: string;
  actionSummary: string;
}

export class VoiceCommandEngine {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((result: TacticalCommandResult) => void) | null = null;
  private onStatusChangeCallback: ((isListening: boolean) => void) | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  public isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public startListening(
    onResult: (result: TacticalCommandResult) => void,
    onStatusChange: (isListening: boolean) => void
  ) {
    this.onResultCallback = onResult;
    this.onStatusChangeCallback = onStatusChange;

    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      onResult({
        matched: false,
        intent: 'UNSUPPORTED',
        transcript: '',
        actionSummary: 'Speech recognition is not supported in this browser. Use the tactical text console.',
      });
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback(true);
    } catch (err) {
      console.warn('Speech recognition start error:', err);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore
      }
    }
    this.isListening = false;
    if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
  }

  public executeTextCommand(text: string): TacticalCommandResult {
    return this.parseAndExecute(text);
  }

  private initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const res = this.parseAndExecute(transcript);
        if (this.onResultCallback) this.onResultCallback(res);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        this.stopListening();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
      };
    }
  }

  private parseAndExecute(input: string): TacticalCommandResult {
    const text = input.toLowerCase().trim();

    // 1. Optics Shaders
    if (text.includes('thermal') || text.includes('flir') || text.includes('heat')) {
      return { matched: true, intent: 'OPTICS_FLIR', transcript: input, actionSummary: 'Engaging Ironbow FLIR Thermal Sensor Optics.' };
    }
    if (text.includes('night vision') || text.includes('nvg') || text.includes('green')) {
      return { matched: true, intent: 'OPTICS_NVG', transcript: input, actionSummary: 'Amplifying Luminous Night Vision (NVG) Sensor.' };
    }
    if (text.includes('crt') || text.includes('scanline') || text.includes('terminal')) {
      return { matched: true, intent: 'OPTICS_CRT', transcript: input, actionSummary: 'Switching to CRT Tactical Phosphor Mode.' };
    }
    if (text.includes('noir') || text.includes('black and white') || text.includes('grayscale')) {
      return { matched: true, intent: 'OPTICS_NOIR', transcript: input, actionSummary: 'Activating Recon Noir High-Contrast Shadow Mode.' };
    }
    if (text.includes('natural') || text.includes('rgb') || text.includes('normal')) {
      return { matched: true, intent: 'OPTICS_NATURAL', transcript: input, actionSummary: 'Restoring Natural RGB Optical Spectrum.' };
    }

    // 2. HUD & Detection
    if (text.includes('hud') || text.includes('heads up')) {
      return { matched: true, intent: 'TOGGLE_HUD', transcript: input, actionSummary: 'Toggling Military Orbital HUD Telemetry.' };
    }
    if (text.includes('detection') || text.includes('box') || text.includes('target')) {
      return { matched: true, intent: 'TOGGLE_DETECTION', transcript: input, actionSummary: 'Toggling Screen-Space Target Detection Brackets.' };
    }

    // 3. Cinematic Corridor Tour
    if (text.includes('tour') || text.includes('fly') || text.includes('cinematic')) {
      return { matched: true, intent: 'CINEMATIC_TOUR', transcript: input, actionSummary: 'Initiating Autonomous Strategic Corridor Inspection Tour.' };
    }

    // 4. PDF SitRep Report
    if (text.includes('report') || text.includes('pdf') || text.includes('download') || text.includes('sitrep')) {
      return { matched: true, intent: 'DOWNLOAD_SITREP', transcript: input, actionSummary: 'Generating Official MDoNER Situation Intelligence Report (SitRep).' };
    }

    // 5. Geographic Navigation Targets
    if (text.includes('sikkim') || text.includes('mangan') || text.includes('chungthang')) {
      return { matched: true, intent: 'NAV_SIKKIM', transcript: input, actionSummary: 'Plotting Intercept: North Sikkim (Chungthang & Mangan).' };
    }
    if (text.includes('assam') || text.includes('haflong') || text.includes('dima hasao')) {
      return { matched: true, intent: 'NAV_ASSAM', transcript: input, actionSummary: 'Plotting Intercept: Haflong Mountain Pass (Dima Hasao, Assam).' };
    }
    if (text.includes('manipur') || text.includes('noney') || text.includes('tupul')) {
      return { matched: true, intent: 'NAV_MANIPUR', transcript: input, actionSummary: 'Plotting Intercept: Tupul Mountain Railway Corridor (Noney, Manipur).' };
    }
    if (text.includes('meghalaya') || text.includes('cherrapunji') || text.includes('shillong') || text.includes('khasi')) {
      return { matched: true, intent: 'NAV_MEGHALAYA', transcript: input, actionSummary: 'Plotting Intercept: East Khasi Hills (Cherrapunji, Meghalaya).' };
    }
    if (text.includes('arunachal') || text.includes('itanagar')) {
      return { matched: true, intent: 'NAV_ARUNACHAL', transcript: input, actionSummary: 'Plotting Intercept: Papum Pare Foothills (Itanagar, Arunachal).' };
    }

    return {
      matched: false,
      intent: 'UNKNOWN',
      transcript: input,
      actionSummary: `Command recognized: "${input}". Try "Switch to FLIR", "Start tour", "Inspect Sikkim", or "Download report".`,
    };
  }
}

export const voiceCommandEngine = new VoiceCommandEngine();
