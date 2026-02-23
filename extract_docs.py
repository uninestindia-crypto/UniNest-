def main():
    import PyPDF2
    import docx
    
    files = [
        r"c:\Users\user\Downloads\Uninest Platform Development Strategy.pdf",
        r"c:\Users\user\Downloads\uninest_strategy.pdf",
        r"c:\Users\user\Downloads\Uninest_Launch_Vendor_Strategy.docx"
    ]
    
    with open("extracted_utf8.txt", 'w', encoding='utf-8') as out:
        for f in files:
            out.write(f"--- Extracting: {f} ---\n")
            try:
                if f.lower().endswith(".pdf"):
                    text = ""
                    with open(f, 'rb') as file:
                        reader = PyPDF2.PdfReader(file)
                        for page in reader.pages:
                            out.write(page.extract_text() + "\n")
                elif f.lower().endswith(".docx"):
                    doc = docx.Document(f)
                    text = "\n".join([para.text for para in doc.paragraphs])
                    out.write(text + "\n")
            except Exception as e:
                out.write(f"Error extracting {f}: {e}\n")
            out.write("\n\n")

if __name__ == "__main__":
    main()
