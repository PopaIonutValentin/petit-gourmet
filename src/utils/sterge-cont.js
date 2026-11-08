const retete = require('../models/retete');
const utilizatori = require('../models/utilizatori');
const poze = require('../models/poze');

async function stergeContulCuPoze(id) 
{
    const numelePozelor = retete.listeazaPozeleAutorului(id);

    utilizatori.stergeUtilizator(id);

    for(const numePoza of numelePozelor)
    {
        try
        {
            await poze.stergePoza(numePoza);
        }
        catch (eroare)
        {
            console.warn('Poza contului sters nu a putut fi stearsa:', numePoza, eroare.code);
        }
    }
}

module.exports = {stergeContulCuPoze};