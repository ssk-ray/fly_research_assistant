import streamlit as st
import tempfile
import os
from ingest import ingest_pdf
from rag import ask_paper
 
st.set_page_config(page_title="Fly — Research Paper Assistant", page_icon="🪁", layout="wide")
 
# --- Session state setup ---
if "history" not in st.session_state:
    st.session_state.history = []
if "doc_ready" not in st.session_state:
    st.session_state.doc_ready = False
if "doc_name" not in st.session_state:
    st.session_state.doc_name = None
 
# --- Sidebar: upload + process document ---
with st.sidebar:
    st.header("📄 Upload a Paper")
    uploaded_file = st.file_uploader("Choose a PDF", type=["pdf"])
 
    if uploaded_file is not None:
        if st.button("Process Document", use_container_width=True):
            with st.spinner("Reading and indexing your paper... this can take a minute."):
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(uploaded_file.read())
                    tmp_path = tmp.name
 
                num_pages, num_chunks = ingest_pdf(tmp_path)
                os.remove(tmp_path)
 
                st.session_state.doc_ready = True
                st.session_state.doc_name = uploaded_file.name
                st.session_state.history = []  # fresh chat for the new document
 
            st.success(f"Indexed {num_pages} pages into {num_chunks} chunks!")
 
    if st.session_state.doc_ready:
        st.markdown("---")
        st.markdown(f"**Active document:**  \n{st.session_state.doc_name}")
        if st.button("🗑️ Clear chat", use_container_width=True):
            st.session_state.history = []
            st.rerun()
 
# --- Main area ---
st.title("🪁 Fly")
st.caption("Your personal research paper assistant — ask questions, get answers grounded in the paper, with sources.")
 
if not st.session_state.doc_ready:
    st.info("👈 Upload a research paper PDF in the sidebar and click **Process Document** to get started.")
else:
    # Replay the conversation so far
    for turn in st.session_state.history:
        with st.chat_message("user"):
            st.write(turn["question"])
        with st.chat_message("assistant"):
            st.write(turn["answer"])
            if turn.get("sources"):
                with st.expander("📚 Sources used"):
                    for i, src in enumerate(turn["sources"]):
                        st.markdown(f"**Source {i + 1}** — page {src['page']}")
                        st.caption(src["text"])
 
    # New question input, pinned at the bottom like a real chat app
    question = st.chat_input("Ask something about the paper...")
 
    if question:
        with st.chat_message("user"):
            st.write(question)
 
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                answer, sources = ask_paper(question, history=st.session_state.history)
            st.write(answer)
            if sources:
                with st.expander("📚 Sources used"):
                    for i, src in enumerate(sources):
                        st.markdown(f"**Source {i + 1}** — page {src['page']}")
                        st.caption(src["text"])
 
        st.session_state.history.append({
            "question": question,
            "answer": answer,
            "sources": sources
        })
 