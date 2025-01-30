import Header from './header'
import Box1 from './Box1'
import Box4 from './Box4'
import Box12 from './Box12'
import Box13 from './Box13'
import Box14 from './Box14'

const RoadFeature = () => {


  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>Road Feature Impact Analysis</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>
      
       <div className="dash1">
       <div className="dashboard-box1">
          <Box1 />
        </div>

        <div className="dashboard-box2">
          <Box12 />
        </div>

        <div className="dashboard-box2">
          <Box13 />
        </div>

        <div className="dashboard-box2">
          <Box14 />
        </div>
       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default RoadFeature