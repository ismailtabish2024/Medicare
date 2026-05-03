
import Banner from "../component/Banner";
import Certification from "../component/Certification";
import Footer from "../component/Footer";
import HomeDoctors from "../component/HomeDoctors";
import NavBar from "../component/NavBar";
import Testimonial from "../component/Testimonial";


const Home = () => {
  return (
    <div>
   <NavBar />
   <Banner />
   <Certification />
   <HomeDoctors />
   <Testimonial />
   <Footer />
   
    </div>
  );
};

export default Home;
