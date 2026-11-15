import ListaRetete from '../componente/ListaRetete.jsx';

export default function PaginaFeed({utilizator})
{
    return (
        <>
            <h1>Feed</h1>
            <ListaRetete
                filtre=""
                utilizator={utilizator}
                mesajGol={<p>Nu exista inca retete publice.</p>}
            />
        </>
    );
}