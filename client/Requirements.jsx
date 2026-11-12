export function Requirements({ challenge, english }) {
  return (
    <div className="requirements">
      <div>
        <h2>{english ? "Functional requirements" : "機能要件"}</h2>
        <ul>
          {challenge.functionalRequirements.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>{english ? "Non-functional requirements" : "非機能要件"}</h2>
        <ul>
          {challenge.nonFunctionalRequirements.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
