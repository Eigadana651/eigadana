import '../App.css'

function PopCard({ text }) {
    return (
        <article className="popCard">
            <div className="popLine" />
            
            <p className="popText">
                {text}
            </p>

            <div className="popLine" />
            </article>)
}

export default PopCard
