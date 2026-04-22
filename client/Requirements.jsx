export function Requirements({ challenge }) {
  return (
    <div className="requirements">
      <div>
        <h2>機能要件</h2>
        <ul>
          {challenge.functionalRequirements.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>非機能要件</h2>
        <ul>
          {challenge.nonFunctionalRequirements.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>面接メモ</h2>
        <ul>
          {challenge.interviewPrompts.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
