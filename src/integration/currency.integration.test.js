const { CurrencyIntegration } = require('./currency.integration');

describe('CurrencyIntegration - Pruebas de API Externa', () => {
    test('Debería obtener un tipo de cambio mayor a 10 MXN', async () => {
        const rate = await CurrencyIntegration.getUsdToMxnRate();
        
        expect(typeof rate).toBe('number');
        expect(rate).toBeGreaterThan(10);
        expect(rate).toBeLessThan(30);
    });
});