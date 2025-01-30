import Header from './header'
import Box12 from './Box12'
import Box13 from './Box13'
import Box14 from './Box14'
import Box15 from './Box15'
import Box16 from './Box16'
import Box17 from './Box17'
import Box18 from './Box18'

const Timenalysis = () => {


  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>Time Based Analysis</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>
      
       <div className="dash1">
       <div className="dashboard-box2">
          <Box15 />
        </div>

        <div className="dashboard-box4">
          <Box16 />
        </div>

        <div className="dashboard-box2">
          <Box17 />
        </div>

        <div className="dashboard-box2">
          <Box18 />
        </div>
       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default Timenalysis