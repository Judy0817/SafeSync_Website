
import Header from './header'
import Box1 from './Box1'
import Box2 from './Box2'
import Box4 from './Box4'
import Box5 from './Box5'
import Box3 from './Box3'
import Box20 from './Box20'
import Box7 from './Box7'

const HomePage = () => {


  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>Pure Flow Dashboard</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>
      
       <div className="dash1">
       <div className="dashboard-box1">
          <Box20 />
        </div>

        <div className="dashboard-box2">
          <Box2 />
        </div>

        <div className="dashboard-box3">
          <Box3 />
        </div>

        <div className="dashboard-box4">
          <Box7 />
        </div>

        <div className="dashboard-box5">
          <Box5 />
        </div>
       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default HomePage
