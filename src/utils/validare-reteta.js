function lungime(text)
{
    return [...text].length;
}

function verificaText(valoare, nume, min, max)
{
    if(typeof valoare !== 'string')
    {
        return `${nume} lipseste.`;
    }

    const numarCaractere = lungime(valoare.trim());

    if(numarCaractere < min || numarCaractere >max)
    {
        return `${nume} trebuie sa aiba intre ${min} si ${max} caractere.`;
    }

    return null;
}

function valideazaReteta(date)
{
    if(typeof date !== 'object' || date === null)
    {
        return 'Datele retetei lipsesc.';
    }

    const {titlu, descriere, vizibilitate, categorie_id, ingrediente, pasi} = date;

    const eroare = verificaText(titlu, 'Titlul', 3, 100)
        ?? verificaText(descriere, 'Descrierea', 10, 2000);

    if(eroare)
    {
        return eroare;
    }

    if(vizibilitate !== 'public' && vizibilitate !== 'private')
    {
        return 'Vizibilitatea trebuie sa fie public sau private.';
    }

    const areCategorie = categorie_id !== undefined && categorie_id !== null;

    if(areCategorie && (!Number.isSafeInteger(categorie_id) || categorie_id < 1))
    {
        return 'Categoria nu este valida.';
    }

    if(!Array.isArray(ingrediente) || ingrediente.length < 1 || ingrediente.length > 50)
    {
        return 'Reteta trebuie sa aiba intre 1 si 50 de ingrediente.';
    }

    for(const ingredient of ingrediente)
    {
        if (typeof ingredient !== 'object' || ingredient === null)
        {
            return 'Fiecare ingredient trebuie sa aiba nume si cantitate.';
        }

        const eroareIngredient = verificaText(ingredient.nume, 'Numele ingredientului', 1, 100)
            ?? verificaText(ingredient.cantitate, 'Cantitate', 1, 50);

        if(eroareIngredient)
        {
            return eroareIngredient;
        }
    }

    if(!Array.isArray(pasi) || pasi.length < 1 || pasi.length > 50)
    {
        return 'Reteta trebuie sa aiba intre 1 si 50 de pasi.';
    }

    for(const pas of pasi)
    {
        const eroarePas = verificaText(pas, 'Fiecare pas', 1, 1000);

        if (eroarePas)
        {
            return eroarePas;
        }
    }

    return null;
}

function curataReteta(date)
{
    return{
        titlu: date.titlu.trim(),
        descriere: date.descriere.trim(),
        vizibilitate: date.vizibilitate,
        categorie_id: date.categorie_id ?? null,
        ingrediente: date.ingrediente.map((ingredient) => ({ nume: ingredient.nume.trim(), cantitate: ingredient.cantitate.trim() })),
        pasi: date.pasi.map((pas) => pas.trim())
    };
}

module.exports = {valideazaReteta, curataReteta};