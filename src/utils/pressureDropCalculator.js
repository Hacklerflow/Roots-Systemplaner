/**
 * Druckverlust-Berechnungen für hydraulische Systeme
 * Basiert auf wissenschaftlichen Formeln: Darcy-Weisbach, Colebrook-White, Haaland, Swamee-Jain, Churchill
 *
 * Port der Python-Implementierung von druckverlust_calculator.py
 */

/**
 * Fluideigenschaften (Wärmeträgerflüssigkeit)
 */
export class FluidProperties {
  /**
   * @param {string} name - Name des Fluids
   * @param {number} density - Dichte in kg/m³
   * @param {number} dynamicViscosity - Dynamische Viskosität in Pa·s
   * @param {number} specificHeat - Spezifische Wärmekapazität in J/(kg·K)
   * @param {number} thermalConductivity - Wärmeleitfähigkeit in W/(m·K)
   */
  constructor(name, density, dynamicViscosity, specificHeat, thermalConductivity) {
    this.name = name;
    this.density = density; // ρ [kg/m³]
    this.dynamicViscosity = dynamicViscosity; // μ [Pa·s]
    this.specificHeat = specificHeat; // cp [J/(kg·K)]
    this.thermalConductivity = thermalConductivity; // λ [W/(m·K)]
  }

  /**
   * Kinematische Viskosität
   * @returns {number} ν in m²/s
   */
  get kinematicViscosity() {
    return this.dynamicViscosity / this.density;
  }

  /**
   * Wasser bei 20°C
   * @returns {FluidProperties}
   */
  static water_20C() {
    return new FluidProperties(
      'Wasser 20°C',
      998.2,          // kg/m³
      0.001002,       // Pa·s
      4182,           // J/(kg·K)
      0.598           // W/(m·K)
    );
  }

  /**
   * Wasser bei 60°C
   * @returns {FluidProperties}
   */
  static water_60C() {
    return new FluidProperties(
      'Wasser 60°C',
      983.2,          // kg/m³
      0.000467,       // Pa·s
      4185,           // J/(kg·K)
      0.651           // W/(m·K)
    );
  }

  /**
   * Propylenglykol 30% Mischung
   * @param {number} tempC - Temperatur in °C
   * @returns {FluidProperties}
   */
  static propyleneGlycol_30_percent(tempC = 20) {
    // Vereinfachte Interpolation für 30% PG
    const densityData = {
      20: 1020,
      40: 1010,
      60: 995
    };
    const viscosityData = {
      20: 0.00230,
      40: 0.00120,
      60: 0.00075
    };

    // Lineare Interpolation
    const density = this._interpolate(tempC, densityData);
    const viscosity = this._interpolate(tempC, viscosityData);

    return new FluidProperties(
      `Propylenglykol 30% bei ${tempC}°C`,
      density,
      viscosity,
      4000,           // J/(kg·K) - Approximation
      0.45            // W/(m·K) - Approximation
    );
  }

  /**
   * Lineare Interpolation
   * @private
   */
  static _interpolate(temp, data) {
    const temps = Object.keys(data).map(Number).sort((a, b) => a - b);

    if (temp <= temps[0]) return data[temps[0]];
    if (temp >= temps[temps.length - 1]) return data[temps[temps.length - 1]];

    for (let i = 0; i < temps.length - 1; i++) {
      if (temp >= temps[i] && temp <= temps[i + 1]) {
        const t1 = temps[i];
        const t2 = temps[i + 1];
        const v1 = data[t1];
        const v2 = data[t2];
        return v1 + (v2 - v1) * (temp - t1) / (t2 - t1);
      }
    }
    return data[temps[0]];
  }
}

/**
 * Rohreigenschaften
 */
export class PipeProperties {
  /**
   * @param {number} innerDiameter - Innendurchmesser in m
   * @param {number} roughness - Absolute Wandrauhigkeit in m
   */
  constructor(innerDiameter, roughness) {
    this.innerDiameter = innerDiameter; // d [m]
    this.roughness = roughness;         // k [m]
  }

  /**
   * Relative Rauhigkeit (dimensionslos)
   * @returns {number} k/d
   */
  get relativeRoughness() {
    return this.roughness / this.innerDiameter;
  }

  /**
   * Rohrquerschnittsfläche
   * @returns {number} A in m²
   */
  get crossSectionArea() {
    return Math.PI * Math.pow(this.innerDiameter, 2) / 4;
  }

  /**
   * Geberit Mapress Therm Rohre (Standard Press-Stahl verzinkt)
   * @param {string} dn - Nennweite (z.B. 'DN20')
   * @returns {PipeProperties}
   */
  static geberitMapressTherm(dn) {
    const pipeData = {
      'DN15': { innerDiameter: 0.0145, roughness: 0.000001 },
      'DN20': { innerDiameter: 0.0180, roughness: 0.000001 },
      'DN25': { innerDiameter: 0.0229, roughness: 0.000001 },
      'DN32': { innerDiameter: 0.0295, roughness: 0.000001 },
      'DN40': { innerDiameter: 0.0373, roughness: 0.000001 },
      'DN50': { innerDiameter: 0.0480, roughness: 0.000001 },
      'DN65': { innerDiameter: 0.0615, roughness: 0.000001 },
      'DN80': { innerDiameter: 0.0770, roughness: 0.000001 }
    };

    const data = pipeData[dn];
    if (!data) {
      throw new Error(`Unbekannte Nennweite: ${dn}`);
    }

    return new PipeProperties(data.innerDiameter, data.roughness);
  }
}

/**
 * Druckverlust-Calculator
 */
export class PressureDropCalculator {
  /**
   * @param {FluidProperties} fluid - Fluideigenschaften
   * @param {PipeProperties} pipe - Rohreigenschaften
   */
  constructor(fluid, pipe) {
    this.fluid = fluid;
    this.pipe = pipe;
  }

  /**
   * Berechnet die Reynolds-Zahl
   * @param {number} velocity - Strömungsgeschwindigkeit in m/s
   * @returns {number} Reynolds-Zahl (dimensionslos)
   */
  calculateReynoldsNumber(velocity) {
    return (velocity * this.pipe.innerDiameter) / this.fluid.kinematicViscosity;
  }

  /**
   * Strömungsgeschwindigkeit aus Volumenstrom
   * @param {number} volumeFlow - Volumenstrom in m³/s
   * @returns {number} Geschwindigkeit in m/s
   */
  velocityFromVolumeFlow(volumeFlow) {
    return volumeFlow / this.pipe.crossSectionArea;
  }

  /**
   * Reibungskoeffizient nach Colebrook-White (iterativ)
   * Genauigkeit: ±0.1%
   *
   * @param {number} reynolds - Reynolds-Zahl
   * @returns {number} Reibungskoeffizient λ
   */
  frictionFactorColebrookWhite(reynolds) {
    // Laminar flow
    if (reynolds < 2300) {
      return 64 / reynolds;
    }

    // Turbulent flow - iterative solution
    const relRoughness = this.pipe.relativeRoughness;
    let lambda = 0.02; // Initial guess
    const maxIterations = 100;
    const tolerance = 1e-6;

    for (let i = 0; i < maxIterations; i++) {
      const term1 = relRoughness / 3.71;
      const term2 = 2.51 / (reynolds * Math.sqrt(lambda));
      const lambdaNew = Math.pow(-2 * Math.log10(term1 + term2), -2);

      if (Math.abs(lambdaNew - lambda) < tolerance) {
        return lambdaNew;
      }
      lambda = lambdaNew;
    }

    return lambda;
  }

  /**
   * Reibungskoeffizient nach Haaland (explizit)
   * Genauigkeit: ±1.4%
   * Empfohlen für die meisten Anwendungen (schnell und genau)
   *
   * @param {number} reynolds - Reynolds-Zahl
   * @returns {number} Reibungskoeffizient λ
   */
  frictionFactorHaaland(reynolds) {
    // Laminar flow
    if (reynolds < 2300) {
      return 64 / reynolds;
    }

    // Turbulent flow - Haaland equation
    const relRoughness = this.pipe.relativeRoughness;
    const term1 = Math.pow(relRoughness / 3.7, 1.11);
    const term2 = 6.9 / reynolds;

    return Math.pow(-1.8 * Math.log10(term1 + term2), -2);
  }

  /**
   * Reibungskoeffizient nach Swamee-Jain (explizit)
   * Genauigkeit: ±2%
   * Gültig für: 5000 < Re < 10^8 und 10^-6 < k/d < 10^-2
   *
   * @param {number} reynolds - Reynolds-Zahl
   * @returns {number} Reibungskoeffizient λ
   */
  frictionFactorSwameeJain(reynolds) {
    // Laminar flow
    if (reynolds < 2300) {
      return 64 / reynolds;
    }

    // Turbulent flow - Swamee-Jain equation
    const relRoughness = this.pipe.relativeRoughness;
    const numerator = 0.25;
    const term1 = relRoughness / 3.7;
    const term2 = 5.74 / Math.pow(reynolds, 0.9);
    const denominator = Math.pow(Math.log10(term1 + term2), 2);

    return numerator / denominator;
  }

  /**
   * Reibungskoeffizient nach Churchill (universal)
   * Gültig für alle Reynolds-Zahlen (laminar und turbulent)
   * Genauigkeit: ±2-3%
   *
   * @param {number} reynolds - Reynolds-Zahl
   * @returns {number} Reibungskoeffizient λ
   */
  frictionFactorChurchill(reynolds) {
    const relRoughness = this.pipe.relativeRoughness;

    // Term A
    const A = Math.pow(
      -2.457 * Math.log(
        Math.pow(7 / reynolds, 0.9) + 0.27 * relRoughness
      ),
      16
    );

    // Term B
    const B = Math.pow(37530 / reynolds, 16);

    // Churchill equation
    return 8 * Math.pow(
      Math.pow(8 / reynolds, 12) + Math.pow(A + B, -1.5),
      1 / 12
    );
  }

  /**
   * Bestimmt Strömungsregime basierend auf Reynolds-Zahl
   * @param {number} reynolds - Reynolds-Zahl
   * @returns {string} 'laminar', 'transitional', oder 'turbulent'
   */
  getFlowRegime(reynolds) {
    if (reynolds < 2300) return 'laminar';
    if (reynolds < 4000) return 'transitional';
    return 'turbulent';
  }

  /**
   * Hauptmethode: Berechnet Druckverlust
   *
   * @param {number} volumeFlow - Volumenstrom in m³/s
   * @param {number} length - Rohrlänge in m
   * @param {string} method - Berechnungsmethode ('haaland', 'colebrook-white', 'swamee-jain', 'churchill')
   * @returns {object} Berechnungsergebnisse
   */
  calculatePressureDrop(volumeFlow, length, method = 'haaland') {
    // Strömungsgeschwindigkeit
    const velocity = this.velocityFromVolumeFlow(volumeFlow);

    // Reynolds-Zahl
    const reynolds = this.calculateReynoldsNumber(velocity);

    // Reibungskoeffizient basierend auf Methode
    let frictionFactor;
    switch (method.toLowerCase()) {
      case 'colebrook-white':
      case 'colebrook':
        frictionFactor = this.frictionFactorColebrookWhite(reynolds);
        break;
      case 'haaland':
        frictionFactor = this.frictionFactorHaaland(reynolds);
        break;
      case 'swamee-jain':
      case 'swamee':
        frictionFactor = this.frictionFactorSwameeJain(reynolds);
        break;
      case 'churchill':
        frictionFactor = this.frictionFactorChurchill(reynolds);
        break;
      default:
        throw new Error(`Unbekannte Berechnungsmethode: ${method}`);
    }

    // Darcy-Weisbach Gleichung: Δp = λ × (L/d) × (ρ × v²/2)
    const pressureDrop_pa = frictionFactor *
      (length / this.pipe.innerDiameter) *
      (this.fluid.density * Math.pow(velocity, 2) / 2);

    // Umrechnung in Meter Wassersäule (bei 4°C: ρ = 1000 kg/m³, g = 9.81 m/s²)
    const pressureDrop_m = pressureDrop_pa / (1000 * 9.81);

    return {
      pressureDrop_pa,           // Pascal
      pressureDrop_m,            // Meter Wassersäule
      velocity_ms: velocity,     // Geschwindigkeit m/s
      reynolds,                  // Reynolds-Zahl
      frictionFactor,            // Lambda λ
      flowRegime: this.getFlowRegime(reynolds)
    };
  }

  /**
   * Hilfsmethode: Berechnet Volumenstrom aus Heizleistung
   *
   * @param {number} power_w - Heizleistung in W
   * @param {number} deltaT_k - Temperaturdifferenz in K (z.B. Vorlauf - Rücklauf)
   * @param {FluidProperties} fluid - Fluideigenschaften
   * @returns {number} Volumenstrom in m³/s
   */
  static volumeFlowFromPower(power_w, deltaT_k, fluid) {
    // Q = m × cp × ΔT
    // m = ρ × V̇
    // => V̇ = Q / (ρ × cp × ΔT)

    if (deltaT_k === 0) {
      throw new Error('Temperaturdifferenz darf nicht 0 sein');
    }

    return power_w / (fluid.density * fluid.specificHeat * deltaT_k);
  }

  /**
   * Hilfsmethode: Berechnet Heizleistung aus Volumenstrom
   *
   * @param {number} volumeFlow_m3s - Volumenstrom in m³/s
   * @param {number} deltaT_k - Temperaturdifferenz in K
   * @param {FluidProperties} fluid - Fluideigenschaften
   * @returns {number} Heizleistung in W
   */
  static powerFromVolumeFlow(volumeFlow_m3s, deltaT_k, fluid) {
    // Q = m × cp × ΔT = ρ × V̇ × cp × ΔT
    return volumeFlow_m3s * fluid.density * fluid.specificHeat * deltaT_k;
  }
}

/**
 * Convenience-Funktion: Quick calculation mit Standard-Parametern
 *
 * @param {object} params - Parameter-Objekt
 * @returns {object} Berechnungsergebnisse
 */
export function quickPressureDropCalculation(params) {
  const {
    volumeFlow_m3s = null,
    power_w = null,
    deltaT_k = 5,
    length_m,
    innerDiameter_mm,
    roughness_mm = 0.001,
    fluidName = 'water',
    fluidTemp_c = 20,
    method = 'haaland'
  } = params;

  // Fluid erstellen
  let fluid;
  if (fluidName === 'water' || fluidName === 'wasser') {
    fluid = fluidTemp_c <= 40 ? FluidProperties.water_20C() : FluidProperties.water_60C();
  } else if (fluidName.includes('glycol') || fluidName.includes('glykol')) {
    fluid = FluidProperties.propyleneGlycol_30_percent(fluidTemp_c);
  } else {
    fluid = FluidProperties.water_20C();
  }

  // Rohr erstellen
  const pipe = new PipeProperties(innerDiameter_mm / 1000, roughness_mm / 1000);

  // Calculator erstellen
  const calculator = new PressureDropCalculator(fluid, pipe);

  // Volumenstrom bestimmen
  let volumeFlow;
  if (volumeFlow_m3s !== null) {
    volumeFlow = volumeFlow_m3s;
  } else if (power_w !== null) {
    volumeFlow = PressureDropCalculator.volumeFlowFromPower(power_w, deltaT_k, fluid);
  } else {
    throw new Error('Entweder volumeFlow_m3s oder power_w muss angegeben werden');
  }

  return calculator.calculatePressureDrop(volumeFlow, length_m, method);
}

export default PressureDropCalculator;
