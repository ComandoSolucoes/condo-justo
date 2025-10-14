from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
def create_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    c.drawString(100, 750, "Este é um PDF de teste para a proposta.")
    c.save()
if __name__ == "__main__":
    create_pdf("test_proposal.pdf")
