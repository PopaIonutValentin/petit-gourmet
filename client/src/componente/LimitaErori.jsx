import {Component} from 'react';

export default class LimitaErori extends Component
{
    state = {areEroare: false};

    static getDerivedStateFromError()
    {
        return {areEroare: true};
    }

    render()
    {
        if(this.state.areEroare)
        {
            return (
                <div className="cont-pagina">
                    <section className="cont-card" role="alert">
                        <h1>Ceva nu a mers bine</h1>
                        <p className="cont-subtitlu">Pagina a intampinat o eroare. Reincarc-o ca sa incerci din nou.</p>
                        <button type="button" className="cont-buton" onClick={() => window.location.reload()}>
                            Reincarca pagina
                        </button>
                    </section>
                </div>
            );
        }

        return this.props.children;
    }
}