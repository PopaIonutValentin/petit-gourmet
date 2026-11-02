const app = require('./app');
const retete = require('./models/retete');
const poze = require('./models/poze');

const PORT = Number(process.env.PORT) || 5000;

async function porneste()
{
    const numarSterse = await poze.stergePozeOrfane(retete.listeazaPozeleFolosite());

    if(numarSterse > 0)
    {
        console.log(`Au fost sterse ${numarSterse} poze orfane.`);
    }

    app.listen(PORT, '127.0.0.1', () =>
    {  
        console.log(`Serverul ruleaza la adresa: http://127.0.0.1:${PORT}`);
    });
}

porneste();
