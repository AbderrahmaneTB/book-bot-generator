import Link from "next/link"
import Image from "next/image";
export default function Navbar (){
    return(
        <nav className="navbar">
<div className="navbar-brand">
        <Image  src="/logo.jpg" alt="Booksmith AI Logo" className="logo" width={40} height={40}/>
        <span>Booksmith AI</span>
        </div>
        <div className="nav-links">
<Link href={"./mainchat"} >
    <button className="navbutton">Home</button> 
    </Link>
    <Link href={"./findbook"} >
    <button className="navbutton">suggest book</button> 
    </Link>
    <Link href={"./creatbook"}>
    <button className="navbutton">create your book</button>
    </Link>
    <button className="navbuttonsing">enjoy</button>
    </div>
  </nav>
    )
}