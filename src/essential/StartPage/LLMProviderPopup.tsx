import { Component, createRef } from "react";

export class LLMProviderPopup extends Component {
  providerRef = createRef<HTMLSelectElement>();

  handleProviderSelection() {
    const selectedProvider = this.providerRef.current?.value;
    console.log('Selected LLM Provider:', selectedProvider);
  }

  render() {
    return (
      <div className="popup">
        <h2>Select LLM Provider</h2>
        <select ref={this.providerRef}>
          <option value="">Select a provider</option>
          <option value="OpenAI">OpenAI</option>
          <option value="Sonnet">Sonnet</option>
          <option value="OpenAI-like">OpenAI-like</option>
        </select>
        <button onClick={() => this.handleProviderSelection()}>Submit</button>
        <button>Cancel</button>
      </div>
    );
  }
}

export default LLMProviderPopup;
