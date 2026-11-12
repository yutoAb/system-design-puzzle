import { Component } from "react";

// 画面の描画で例外が出ても白画面にせず、再読み込みの手段を出す
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("[app] render failed", error);
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      <div className="app-status">
        <p>
          画面の表示中に問題が起きました。再読み込みしても直らない場合は、お手数ですがお問い合わせください。
        </p>
        <button
          type="button"
          className="primary"
          onClick={() => window.location.reload()}
        >
          再読み込み
        </button>
      </div>
    );
  }
}
