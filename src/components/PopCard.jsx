import '../App.css'

function PopCard({ text }) {
  return (
    <article className="popCard">
      <div className="popCardContent">
        <p className="popTitle">{text}</p>
      </div>
    </article>
  )
}

export default PopCard