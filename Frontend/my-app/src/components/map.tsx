import Header from './header'
import Box1 from './Box1'
import Box4 from './Box4'
import Box12 from './Box12'
import Box13 from './Box13'
import Box14 from './Box14'
import Box23 from './Box23'
import Box24 from './Box24'
import Box25 from './Box25'

const MapView = () => {


  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>Interactive Map View</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>
      
       <div className="dash1">
       <div className="dashboard-box6">
          <Box24 />
        </div>
       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default MapView
