Example use cases:     

 <ButtonWithGradient
        className='my-new-class'
        text="Fallback text"
        onClick={() => alert('Hello!')}
        type="submit"
      >
        <strong>Login</strong>
      </ButtonWithGradient>

      <br />
      <br />

      <ButtonWithGradient
        text="Save"
        processing={true}
        disabled={true}
      />

      <br />
      <br />

      <ButtonWithGradient
        text={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        onClick={() => setSidebarCollapsed(prev => !prev)}
      />