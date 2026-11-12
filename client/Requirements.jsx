export function Requirements({ challenge, english, strict }) {
  return (
    <div className="requirements">
      <div>
        <h2>{english ? "Problem" : "お題"}</h2>
        <p className="requirements-prompt">{challenge.prompt}</p>
      </div>
      {strict ? (
        // 本番仕様: 要件は見せず、面接官への質問で引き出してもらう
        <p className="panel-copy">
          {english
            ? "Requirements are hidden. Ask the interviewer about scale, scope, and constraints."
            : "要件は表示していません。規模・スコープ・制約を面接官に質問して確認しましょう。"}
        </p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
