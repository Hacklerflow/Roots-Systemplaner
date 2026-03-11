/**
 * Unit Tests für pressureDropCalculator.js
 * Validiert gegen Python-Referenzwerte
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  FluidProperties,
  PipeProperties,
  PressureDropCalculator,
  quickPressureDropCalculation
} from './pressureDropCalculator';

describe('FluidProperties', () => {
  it('should create fluid with correct properties', () => {
    const fluid = new FluidProperties('Test', 1000, 0.001, 4180, 0.6);
    expect(fluid.name).toBe('Test');
    expect(fluid.density).toBe(1000);
    expect(fluid.dynamicViscosity).toBe(0.001);
    expect(fluid.specificHeat).toBe(4180);
    expect(fluid.thermalConductivity).toBe(0.6);
  });

  it('should calculate kinematic viscosity correctly', () => {
    const fluid = new FluidProperties('Water', 1000, 0.001, 4180, 0.6);
    expect(fluid.kinematicViscosity).toBe(0.000001); // 0.001 / 1000
  });

  it('should create water at 20°C with correct properties', () => {
    const water = FluidProperties.water_20C();
    expect(water.name).toBe('Wasser 20°C');
    expect(water.density).toBe(998.2);
    expect(water.dynamicViscosity).toBe(0.001002);
    expect(water.specificHeat).toBe(4182);
    expect(water.kinematicViscosity).toBeCloseTo(0.000001004, 9);
  });

  it('should create water at 60°C with correct properties', () => {
    const water = FluidProperties.water_60C();
    expect(water.name).toBe('Wasser 60°C');
    expect(water.density).toBe(983.2);
    expect(water.dynamicViscosity).toBe(0.000467);
  });

  it('should create propylene glycol with interpolated properties', () => {
    const pg = FluidProperties.propyleneGlycol_30_percent(20);
    expect(pg.density).toBe(1020);
    expect(pg.dynamicViscosity).toBe(0.00230);

    const pg40 = FluidProperties.propyleneGlycol_30_percent(40);
    expect(pg40.density).toBe(1010);

    const pg30 = FluidProperties.propyleneGlycol_30_percent(30);
    expect(pg30.density).toBe(1015); // Linear interpolation
  });
});

describe('PipeProperties', () => {
  it('should create pipe with correct properties', () => {
    const pipe = new PipeProperties(0.02, 0.000001);
    expect(pipe.innerDiameter).toBe(0.02);
    expect(pipe.roughness).toBe(0.000001);
  });

  it('should calculate relative roughness correctly', () => {
    const pipe = new PipeProperties(0.02, 0.000001);
    expect(pipe.relativeRoughness).toBeCloseTo(0.00005, 6); // 0.000001 / 0.02
  });

  it('should calculate cross section area correctly', () => {
    const pipe = new PipeProperties(0.02, 0.000001);
    const expectedArea = Math.PI * Math.pow(0.02, 2) / 4;
    expect(pipe.crossSectionArea).toBeCloseTo(expectedArea, 10);
    expect(pipe.crossSectionArea).toBeCloseTo(0.0003141593, 7);
  });

  it('should create Geberit Mapress Therm DN20 correctly', () => {
    const pipe = PipeProperties.geberitMapressTherm('DN20');
    expect(pipe.innerDiameter).toBe(0.018);
    expect(pipe.roughness).toBe(0.000001);
  });

  it('should create Geberit Mapress Therm DN50 correctly', () => {
    const pipe = PipeProperties.geberitMapressTherm('DN50');
    expect(pipe.innerDiameter).toBe(0.048);
    expect(pipe.roughness).toBe(0.000001);
  });

  it('should throw error for unknown DN', () => {
    expect(() => PipeProperties.geberitMapressTherm('DN100')).toThrow();
  });
});

describe('PressureDropCalculator - Reynolds Number', () => {
  let calculator;

  beforeEach(() => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN20');
    calculator = new PressureDropCalculator(fluid, pipe);
  });

  it('should calculate Reynolds number correctly', () => {
    const velocity = 1.0; // m/s
    const reynolds = calculator.calculateReynoldsNumber(velocity);

    // Re = v × d / ν
    // ν = 0.001002 / 998.2 ≈ 1.004e-6
    // Re = 1.0 × 0.018 / 1.004e-6 ≈ 17932
    expect(reynolds).toBeCloseTo(17932, -1); // Tolerance für ganze Zahlen
  });

  it('should calculate velocity from volume flow correctly', () => {
    const volumeFlow = 0.0002545; // m³/s (≈ 15.3 l/min)
    const velocity = calculator.velocityFromVolumeFlow(volumeFlow);

    // A = π × d² / 4 = π × 0.018² / 4 ≈ 0.0002545 m²
    // v = Q / A = 0.0002545 / 0.0002545 = 1.0 m/s
    expect(velocity).toBeCloseTo(1.0, 2);
  });

  it('should identify laminar flow correctly', () => {
    expect(calculator.getFlowRegime(2000)).toBe('laminar');
    expect(calculator.getFlowRegime(2299)).toBe('laminar');
  });

  it('should identify transitional flow correctly', () => {
    expect(calculator.getFlowRegime(2300)).toBe('transitional');
    expect(calculator.getFlowRegime(3500)).toBe('transitional');
    expect(calculator.getFlowRegime(3999)).toBe('transitional');
  });

  it('should identify turbulent flow correctly', () => {
    expect(calculator.getFlowRegime(4000)).toBe('turbulent');
    expect(calculator.getFlowRegime(100000)).toBe('turbulent');
  });
});

describe('PressureDropCalculator - Friction Factors', () => {
  let calculator;

  beforeEach(() => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN20');
    calculator = new PressureDropCalculator(fluid, pipe);
  });

  describe('Laminar Flow (Re < 2300)', () => {
    it('should calculate friction factor correctly for laminar flow', () => {
      const reynolds = 2000;
      const lambda = calculator.frictionFactorHaaland(reynolds);

      // Laminar: λ = 64 / Re
      expect(lambda).toBeCloseTo(64 / 2000, 6);
      expect(lambda).toBe(0.032);
    });

    it('should return same value for all methods in laminar flow', () => {
      const reynolds = 1000;

      const colebrook = calculator.frictionFactorColebrookWhite(reynolds);
      const haaland = calculator.frictionFactorHaaland(reynolds);
      const swamee = calculator.frictionFactorSwameeJain(reynolds);
      const churchill = calculator.frictionFactorChurchill(reynolds);

      expect(colebrook).toBe(0.064);
      expect(haaland).toBe(0.064);
      expect(swamee).toBe(0.064);
      expect(churchill).toBeCloseTo(0.064, 3); // Churchill kann leicht abweichen
    });
  });

  describe('Turbulent Flow', () => {
    const reynolds = 20000; // Turbulent

    it('should calculate Colebrook-White friction factor (iterativ)', () => {
      const lambda = calculator.frictionFactorColebrookWhite(reynolds);

      // Erwartungswert für glatte Rohre (k/d sehr klein)
      // λ ≈ 0.026 für Re = 20000
      expect(lambda).toBeGreaterThan(0.02);
      expect(lambda).toBeLessThan(0.03);
      expect(lambda).toBeCloseTo(0.026, 2);
    });

    it('should calculate Haaland friction factor (explizit)', () => {
      const lambda = calculator.frictionFactorHaaland(reynolds);

      expect(lambda).toBeGreaterThan(0.02);
      expect(lambda).toBeLessThan(0.03);
      expect(lambda).toBeCloseTo(0.0258, 3);
    });

    it('should calculate Swamee-Jain friction factor', () => {
      const lambda = calculator.frictionFactorSwameeJain(reynolds);

      expect(lambda).toBeGreaterThan(0.02);
      expect(lambda).toBeLessThan(0.03);
    });

    it('should calculate Churchill friction factor', () => {
      const lambda = calculator.frictionFactorChurchill(reynolds);

      expect(lambda).toBeGreaterThan(0.02);
      expect(lambda).toBeLessThan(0.03);
    });

    it('should have Haaland within ±1.4% of Colebrook-White', () => {
      const colebrook = calculator.frictionFactorColebrookWhite(reynolds);
      const haaland = calculator.frictionFactorHaaland(reynolds);

      const deviation = Math.abs(haaland - colebrook) / colebrook;
      expect(deviation).toBeLessThan(0.014); // ±1.4%
    });

    it('should have Swamee-Jain within ±2% of Colebrook-White', () => {
      const colebrook = calculator.frictionFactorColebrookWhite(reynolds);
      const swamee = calculator.frictionFactorSwameeJain(reynolds);

      const deviation = Math.abs(swamee - colebrook) / colebrook;
      expect(deviation).toBeLessThan(0.02); // ±2%
    });
  });

  describe('High Reynolds Numbers', () => {
    it('should handle very high Reynolds numbers', () => {
      const reynolds = 1000000;

      const colebrook = calculator.frictionFactorColebrookWhite(reynolds);
      const haaland = calculator.frictionFactorHaaland(reynolds);

      expect(colebrook).toBeGreaterThan(0.01);
      expect(colebrook).toBeLessThan(0.02);

      const deviation = Math.abs(haaland - colebrook) / colebrook;
      expect(deviation).toBeLessThan(0.02);
    });
  });
});

describe('PressureDropCalculator - Pressure Drop Calculation', () => {
  it('should calculate pressure drop for DN20 at 1 m/s correctly', () => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN20');
    const calculator = new PressureDropCalculator(fluid, pipe);

    // DN20: d = 18 mm, A ≈ 254.5 mm²
    // v = 1 m/s => Q = 1 × 0.0002545 = 0.0002545 m³/s
    const volumeFlow = 0.0002545; // m³/s
    const length = 10; // m

    const result = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');

    expect(result.velocity_ms).toBeCloseTo(1.0, 2);
    expect(result.reynolds).toBeGreaterThan(15000);
    expect(result.flowRegime).toBe('turbulent');
    expect(result.frictionFactor).toBeGreaterThan(0.02);
    expect(result.pressureDrop_pa).toBeGreaterThan(0);
    expect(result.pressureDrop_m).toBeGreaterThan(0);

    // Sanity check: 10m Rohr sollte nicht mehr als 5m Druckverlust haben
    expect(result.pressureDrop_m).toBeLessThan(5);
  });

  it('should calculate pressure drop from heating power', () => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN25');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const power = 5000; // 5 kW
    const deltaT = 5; // 5 K
    const length = 20; // m

    const volumeFlow = PressureDropCalculator.volumeFlowFromPower(power, deltaT, fluid);
    const result = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');

    expect(volumeFlow).toBeGreaterThan(0);
    expect(result.velocity_ms).toBeGreaterThan(0);
    expect(result.pressureDrop_m).toBeGreaterThan(0);
  });

  it('should compare different calculation methods', () => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN32');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const volumeFlow = 0.0005; // m³/s
    const length = 15; // m

    const colebrook = calculator.calculatePressureDrop(volumeFlow, length, 'colebrook-white');
    const haaland = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');
    const swamee = calculator.calculatePressureDrop(volumeFlow, length, 'swamee-jain');
    const churchill = calculator.calculatePressureDrop(volumeFlow, length, 'churchill');

    // All should be in similar range
    expect(haaland.pressureDrop_m).toBeCloseTo(colebrook.pressureDrop_m, 1);
    expect(swamee.pressureDrop_m).toBeCloseTo(colebrook.pressureDrop_m, 1);
    expect(churchill.pressureDrop_m).toBeCloseTo(colebrook.pressureDrop_m, 1);

    // Haaland should be within ±1.4%
    const deviation = Math.abs(haaland.pressureDrop_m - colebrook.pressureDrop_m) / colebrook.pressureDrop_m;
    expect(deviation).toBeLessThan(0.015);
  });

  it('should scale linearly with length', () => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN20');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const volumeFlow = 0.0003;

    const result10m = calculator.calculatePressureDrop(volumeFlow, 10, 'haaland');
    const result20m = calculator.calculatePressureDrop(volumeFlow, 20, 'haaland');

    // Pressure drop should double with double length
    expect(result20m.pressureDrop_m).toBeCloseTo(result10m.pressureDrop_m * 2, 2);
  });

  it('should handle small pipe diameters', () => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN15');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const volumeFlow = 0.0001; // Small flow
    const length = 5;

    const result = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');

    expect(result.pressureDrop_m).toBeGreaterThan(0);
    expect(result.velocity_ms).toBeGreaterThan(0);
  });

  it('should handle large pipe diameters', () => {
    const fluid = FluidProperties.water_20C();
    const pipe = PipeProperties.geberitMapressTherm('DN80');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const volumeFlow = 0.002; // Larger flow
    const length = 30;

    const result = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');

    expect(result.pressureDrop_m).toBeGreaterThan(0);
    expect(result.velocity_ms).toBeGreaterThan(0);
  });
});

describe('Static Helper Methods', () => {
  it('should calculate volume flow from power correctly', () => {
    const fluid = FluidProperties.water_20C();
    const power = 10000; // 10 kW
    const deltaT = 10; // 10 K

    const volumeFlow = PressureDropCalculator.volumeFlowFromPower(power, deltaT, fluid);

    // Q = P / (ρ × cp × ΔT)
    // Q = 10000 / (998.2 × 4182 × 10)
    const expected = 10000 / (998.2 * 4182 * 10);
    expect(volumeFlow).toBeCloseTo(expected, 8);
    expect(volumeFlow).toBeCloseTo(0.0002395, 6);
  });

  it('should calculate power from volume flow correctly', () => {
    const fluid = FluidProperties.water_20C();
    const volumeFlow = 0.0002395; // m³/s
    const deltaT = 10; // 10 K

    const power = PressureDropCalculator.powerFromVolumeFlow(volumeFlow, deltaT, fluid);

    // P = ρ × V̇ × cp × ΔT
    const expected = 998.2 * 0.0002395 * 4182 * 10;
    expect(power).toBeCloseTo(expected, 1);
    expect(power).toBeCloseTo(10000, -1); // Toleranz für ganze Zahlen
  });

  it('should be reversible (power -> flow -> power)', () => {
    const fluid = FluidProperties.water_20C();
    const originalPower = 15000; // W
    const deltaT = 5; // K

    const volumeFlow = PressureDropCalculator.volumeFlowFromPower(originalPower, deltaT, fluid);
    const calculatedPower = PressureDropCalculator.powerFromVolumeFlow(volumeFlow, deltaT, fluid);

    expect(calculatedPower).toBeCloseTo(originalPower, 1);
  });

  it('should throw error for zero temperature difference', () => {
    const fluid = FluidProperties.water_20C();

    expect(() => {
      PressureDropCalculator.volumeFlowFromPower(10000, 0, fluid);
    }).toThrow();
  });
});

describe('quickPressureDropCalculation', () => {
  it('should calculate with volume flow directly', () => {
    const result = quickPressureDropCalculation({
      volumeFlow_m3s: 0.0003,
      length_m: 10,
      innerDiameter_mm: 18,
      method: 'haaland'
    });

    expect(result.pressureDrop_m).toBeGreaterThan(0);
    expect(result.velocity_ms).toBeGreaterThan(0);
    expect(result.reynolds).toBeGreaterThan(0);
  });

  it('should calculate from heating power', () => {
    const result = quickPressureDropCalculation({
      power_w: 5000,
      deltaT_k: 5,
      length_m: 15,
      innerDiameter_mm: 25,
      method: 'haaland'
    });

    expect(result.pressureDrop_m).toBeGreaterThan(0);
    expect(result.velocity_ms).toBeGreaterThan(0);
  });

  it('should use different fluid types', () => {
    const water = quickPressureDropCalculation({
      volumeFlow_m3s: 0.0003,
      length_m: 10,
      innerDiameter_mm: 20,
      fluidName: 'water',
      fluidTemp_c: 20
    });

    const glycol = quickPressureDropCalculation({
      volumeFlow_m3s: 0.0003,
      length_m: 10,
      innerDiameter_mm: 20,
      fluidName: 'glycol',
      fluidTemp_c: 20
    });

    // Glycol hat höhere Viskosität => höherer Druckverlust
    expect(glycol.pressureDrop_m).toBeGreaterThan(water.pressureDrop_m);
  });

  it('should throw error without flow parameters', () => {
    expect(() => {
      quickPressureDropCalculation({
        length_m: 10,
        innerDiameter_mm: 20
      });
    }).toThrow();
  });
});

describe('Real-World Scenarios', () => {
  it('should calculate for typical floor heating circuit (DN20, 100m)', () => {
    const fluid = FluidProperties.water_60C(); // Heizungswasser
    const pipe = PipeProperties.geberitMapressTherm('DN20');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const power = 3000; // 3 kW Heizlast
    const deltaT = 5; // 5 K Spreizung
    const length = 100; // 100 m Rohrlänge

    const volumeFlow = PressureDropCalculator.volumeFlowFromPower(power, deltaT, fluid);
    const result = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');

    expect(result.velocity_ms).toBeGreaterThan(0.1);
    expect(result.velocity_ms).toBeLessThan(2.0); // Typischer Bereich
    expect(result.pressureDrop_m).toBeGreaterThan(0);
    expect(result.flowRegime).toBe('turbulent');
  });

  it('should calculate for radiator circuit (DN15, 20m)', () => {
    const fluid = FluidProperties.water_60C();
    const pipe = PipeProperties.geberitMapressTherm('DN15');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const power = 1500; // 1.5 kW Heizkörper
    const deltaT = 10; // 10 K Spreizung
    const length = 20; // 20 m Rohrlänge

    const volumeFlow = PressureDropCalculator.volumeFlowFromPower(power, deltaT, fluid);
    const result = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');

    expect(result.velocity_ms).toBeGreaterThan(0);
    expect(result.pressureDrop_m).toBeGreaterThan(0);
  });

  it('should calculate for main distribution line (DN50, 50m)', () => {
    const fluid = FluidProperties.water_60C();
    const pipe = PipeProperties.geberitMapressTherm('DN50');
    const calculator = new PressureDropCalculator(fluid, pipe);

    const power = 30000; // 30 kW Gesamtlast
    const deltaT = 5; // 5 K Spreizung
    const length = 50; // 50 m Hauptleitung

    const volumeFlow = PressureDropCalculator.volumeFlowFromPower(power, deltaT, fluid);
    const result = calculator.calculatePressureDrop(volumeFlow, length, 'haaland');

    expect(result.velocity_ms).toBeGreaterThan(0.5);
    expect(result.velocity_ms).toBeLessThan(3.0);
    expect(result.pressureDrop_m).toBeGreaterThan(0);
    expect(result.flowRegime).toBe('turbulent');
  });
});
