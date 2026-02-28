class CurrencyIntegration {
    async getUsdToMxnRate() {
        try {
            const url = process.env.CURRENCY_API_URL;
            
            if (!url) throw new Error('URL no configurada');

            const response = await fetch(url);
            const data = await response.json();
            
            return data.rates.MXN;
        } catch (error) {
            console.error('Error API:', error.message);
            return 18.50;
        }
    }
}

module.exports = { CurrencyIntegration: new CurrencyIntegration() };