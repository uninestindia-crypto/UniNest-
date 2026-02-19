import os
import json
from groq import Groq
from dotenv import load_dotenv

def test_groq_keys():
    # Load environment variables from .env
    load_dotenv()
    
    # Identify keys to test
    keys_to_test = []
    for i in range(1, 9):
        key = os.getenv(f"GROQ_API_KEY_{i}")
        if key:
            keys_to_test.append((f"GROQ_API_KEY_{i}", key))
    
    if not keys_to_test:
        print("No Groq API keys found in .env (expected GROQ_API_KEY_1 to GROQ_API_KEY_8)")
        return

    results = []
    print(f"Starting test for {len(keys_to_test)} keys...\n")

    for name, key in keys_to_test:
        print(f"Testing {name}...")
        try:
            client = Groq(api_key=key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "user",
                        "content": "How are you?"
                    }
                ],
                temperature=1,
                max_tokens=1024,
                top_p=1,
                stream=False,
                stop=None,
            )
            response_text = completion.choices[0].message.content
            results.append({
                "key_name": name,
                "status": "Success",
                "response": response_text
            })
            print(f"  Result: Success")
        except Exception as e:
            results.append({
                "key_name": name,
                "status": "Failed",
                "error": str(e)
            })
            print(f"  Result: Failed - {str(e)}")

    # Save results to a JSON file for the final report
    with open("groq_test_results.json", "w") as f:
        json.dump(results, f, indent=4)
    
    print("\nTests completed. Results saved to groq_test_results.json")

if __name__ == "__main__":
    test_groq_keys()
