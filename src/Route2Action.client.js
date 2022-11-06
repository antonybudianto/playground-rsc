export default function Route2Action() {
  const handleClick = () => {
    history.pushState({}, null, '/');
  };
  return (
    <div>
      <button type="button" onClick={handleClick}>
        go to /
      </button>
    </div>
  );
}
