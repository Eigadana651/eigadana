import '../App.css'

function SectionCard({ text }) {
  return (
    <article className="sectionCard">
      <div className="sectionLine" />

      <p className="sectionText">
        {text}
      </p>

      <div className="sectionLine" />
    </article>
  )
}

export default SectionCard