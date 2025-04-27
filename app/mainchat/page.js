import Link from "next/link";
import Image from "next/image";
import Navbar from '../navbar/page.js'
export default function Home (){
return (
<div>
<Navbar/>
  <div>
  <Image  src="/mainlogo.png" alt="Booksmith AI Logo2" className="logo2" width={500} height={500}/>
  <Link href={"./creatbook"}>
  <button className="signup-btn">Get started and delve in the books world </button>
  </Link>
  <div className="card-container">
      <div className="feature-card">
        <div className="card-icon">📖</div>
        <h3>AI-Generated Books</h3>
        <p>Create your book in any genre with intelligent story crafting</p>
      </div>
      
      <div className="feature-card">
        <div className="card-icon">🔍</div>
        <h3>Personalized Suggestions</h3>
        <p>Get tailored book recommendations based on your preferences</p>
      </div>
      
      <div className="feature-card">
        <div className="card-icon">✨</div>
        <h3>Creative Tools</h3>
        <p>Character builders, plot generators, and world-building assistants</p>
      </div>
    </div>

  </div>
  </div>
)
}